const { pool } = require("../config/database");

/**
 * Shop model for handling shop-related database operations
 */
class ShopModel {
  /**
   * Create a new shop
   * @param {Object} shopData - The shop data
   * @returns {number} The ID of the newly created shop
   */
  async createShop({ title, type, latitude, longitude, status = "active" }) {
    const [result] = await pool.execute(
      "INSERT INTO shops (title, type, latitude, longitude, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [title, type, latitude, longitude, status]
    );

    return result.insertId;
  }

  /**
   * Associate a shop with locations
   * @param {number} shopId - The shop ID
   * @param {Array} locationIds - Array of location IDs
   */
  async assignShopLocations(shopId, locationIds) {
    // Start a transaction
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Delete existing shop location mappings
      await connection.execute("DELETE FROM shop_locations WHERE shop_id = ?", [
        shopId,
      ]);

      // Insert new shop location mappings
      for (const locationId of locationIds) {
        await connection.execute(
          "INSERT INTO shop_locations (shop_id, location_id) VALUES (?, ?)",
          [shopId, locationId]
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get a shop by ID
   * @param {number} id - The shop ID
   * @returns {Object|null} The shop object or null if not found
   */
  async getShopById(id) {
    const [rows] = await pool.execute("SELECT * FROM shops WHERE id = ?", [id]);

    if (rows.length === 0) {
      return null;
    }

    const shop = rows[0];

    // Get associated locations
    const [locations] = await pool.execute(
      `
      SELECT l.*, lt.name as type_name
      FROM shop_locations sl
      JOIN locations l ON sl.location_id = l.id
      JOIN location_types lt ON l.location_type_id = lt.id
      WHERE sl.shop_id = ?
    `,
      [id]
    );

    shop.locations = locations;

    return shop;
  }

  /**
   * Get all shops with optional filtering
   * @param {Object} filters - Optional filters (type, status, locationId)
   * @param {number} page - Page number for pagination
   * @param {number} limit - Number of items per page
   * @returns {Object} Object containing shops and pagination data
   */
  async getShops({ type, status, locationId } = {}, page = 1, limit = 10) {
    try {
      // Ensure parameters are numbers
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;

      let query = "SELECT DISTINCT s.* FROM shops s";
      let params = [];
      const conditions = [];

      // If filtering by location, join with shop_locations
      if (locationId) {
        query += " JOIN shop_locations sl ON s.id = sl.shop_id";
        conditions.push("sl.location_id = ?");
        params.push(Number(locationId));
      }

      if (type) {
        conditions.push("s.type = ?");
        params.push(String(type));
      }

      if (status) {
        conditions.push("s.status = ?");
        params.push(String(status));
      }

      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }

      // Use raw query with the LIMIT clause directly in the SQL string
      // This fixes the "Incorrect arguments to mysqld_stmt_execute" error
      query += ` ORDER BY s.created_at DESC LIMIT ${limitNum} OFFSET ${
        (pageNum - 1) * limitNum
      }`;

      // Execute the query without passing limit and offset as parameters
      const [rows] = await pool.query(query, params);

      // Count query
      let countQuery = "SELECT COUNT(DISTINCT s.id) as total FROM shops s";
      if (locationId) {
        countQuery += " JOIN shop_locations sl ON s.id = sl.shop_id";
      }

      if (conditions.length > 0) {
        countQuery += " WHERE " + conditions.join(" AND ");
      }

      const [countResult] = await pool.query(countQuery, params);
      const total = countResult[0]?.total || 0;

      return {
        shops: rows,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      };
    } catch (error) {
      console.error("Error in getShops:", error);
      throw error;
    }
  }

  /**
   * Update a shop
   * @param {number} id - The shop ID
   * @param {Object} shopData - The shop data to update
   * @returns {boolean} True if the update was successful
   */
  async updateShop(id, { title, type, latitude, longitude, status }) {
    const [result] = await pool.execute(
      "UPDATE shops SET title = ?, type = ?, latitude = ?, longitude = ?, status = ?, updated_at = NOW() WHERE id = ?",
      [title, type, latitude, longitude, status, id]
    );

    return result.affectedRows > 0;
  }

  /**
   * Delete a shop
   * @param {number} id - The shop ID
   * @returns {boolean} True if the deletion was successful
   */
  async deleteShop(id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Delete shop location associations first
      await connection.execute("DELETE FROM shop_locations WHERE shop_id = ?", [
        id,
      ]);

      // Delete the shop
      const [result] = await connection.execute(
        "DELETE FROM shops WHERE id = ?",
        [id]
      );

      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new ShopModel();
