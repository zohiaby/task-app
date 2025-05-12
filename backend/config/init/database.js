const fs = require("fs");
const path = require("path");
const { pool } = require("../database");

/**
 * Initialize the database by running the schema script
 */
async function initializeDatabase() {
  try {
    console.log("Initializing database...");

    // Read the schema SQL file
    const schemaPath = path.join(__dirname, "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");

    // Split statements by semicolon
    const statements = schemaSql
      .split(";")
      .filter((statement) => statement.trim() !== "");

    // Execute each statement
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      for (const statement of statements) {
        await connection.query(statement + ";");
      }

      await connection.commit();
      console.log("Database initialized successfully!");
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}

module.exports = {
  initializeDatabase,
};
