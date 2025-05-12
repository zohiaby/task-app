const { pool } = require("../config/database");

/**
 * Location model for managing dynamic location hierarchies
 */
class LocationModel {
  /**
   * Create a location level type (e.g., 'country', 'state', 'city')
   * @param {string} name - The name of the location level type
   * @param {number} order - The hierarchy order of this level (e.g., 1 for country, 2 for state)
   */
  async createLocationType(name, order) {
    const [result] = await pool.execute(
      "INSERT INTO location_types (name, level_order) VALUES (?, ?)",
      [name, order]
    );
    return result.insertId;
  }

  /**
   * Get all location types ordered by their hierarchy
   */
  async getAllLocationTypes() {
    const [rows] = await pool.execute(
      "SELECT * FROM location_types ORDER BY level_order ASC"
    );
    return rows;
  }

  /**
   * Create a location value (e.g., 'USA', 'New York', 'Manhattan')
   * @param {number} typeId - The location type ID this value belongs to
   * @param {string} name - The name of the location
   * @param {number|null} parentId - The parent location ID (null for top-level locations)
   */
  async createLocation(typeId, name, parentId = null) {
    const [result] = await pool.execute(
      "INSERT INTO locations (location_type_id, name, parent_location_id) VALUES (?, ?, ?)",
      [typeId, name, parentId]
    );
    return result.insertId;
  }

  /**
   * Get locations by their type
   * @param {number} typeId - The location type ID
   * @param {number|null} parentId - Optional parent location ID to filter by
   */
  async getLocationsByType(typeId, parentId = null) {
    let query = "SELECT * FROM locations WHERE location_type_id = ?";
    const params = [typeId];

    if (parentId !== null) {
      query += " AND parent_location_id = ?";
      params.push(parentId);
    } else {
      query += " AND parent_location_id IS NULL";
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  /**
   * Get location by ID
   * @param {number} id - The location ID
   */
  async getLocationById(id) {
    const [rows] = await pool.execute("SELECT * FROM locations WHERE id = ?", [
      id,
    ]);
    return rows[0] || null;
  }

  /**
   * Update a location
   * @param {number} id - The location ID
   * @param {object} data - The location data to update
   */
  async updateLocation(id, { name, typeId, parentId }) {
    const [result] = await pool.execute(
      "UPDATE locations SET name = ?, location_type_id = ?, parent_location_id = ? WHERE id = ?",
      [name, typeId, parentId, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Delete a location
   * @param {number} id - The location ID
   */
  async deleteLocation(id) {
    // First check if this location has children
    const [children] = await pool.execute(
      "SELECT COUNT(*) as count FROM locations WHERE parent_location_id = ?",
      [id]
    );

    if (children[0].count > 0) {
      throw new Error("Cannot delete location with children locations");
    }

    // Also check if the location is used by any shops
    const [usedByShops] = await pool.execute(
      "SELECT COUNT(*) as count FROM shop_locations WHERE location_id = ?",
      [id]
    );

    if (usedByShops[0].count > 0) {
      throw new Error("Cannot delete location used by shops");
    }

    const [result] = await pool.execute("DELETE FROM locations WHERE id = ?", [
      id,
    ]);

    return result.affectedRows > 0;
  }

  /**
   * Get complete location hierarchy path for a location
   * @param {number} locationId - The location ID
   */
  async getLocationPath(locationId) {
    // This recursive query gets the entire path from the given location up to the root
    const query = `
      WITH RECURSIVE location_path AS (
        SELECT id, name, location_type_id, parent_location_id, 1 as level
        FROM locations
        WHERE id = ?
        
        UNION ALL
        
        SELECT l.id, l.name, l.location_type_id, l.parent_location_id, lp.level + 1
        FROM locations l
        JOIN location_path lp ON l.id = lp.parent_location_id
      )
      SELECT lp.*, lt.name as type_name
      FROM location_path lp
      JOIN location_types lt ON lp.location_type_id = lt.id
      ORDER BY lp.level DESC
    `;

    const [rows] = await pool.execute(query, [locationId]);
    return rows;
  }

  /**
   * Get all locations with their type information
   */
  async getAllLocations() {
    const query = `
      SELECT l.*, lt.name as type_name 
      FROM locations l
      JOIN location_types lt ON l.location_type_id = lt.id
      ORDER BY lt.level_order ASC, l.name ASC
    `;
    const [rows] = await pool.execute(query);
    return rows;
  }
}

module.exports = new LocationModel();
