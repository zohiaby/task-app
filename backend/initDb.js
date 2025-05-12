const mysql = require("mysql2/promise");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

async function initializeDatabase() {
  console.log("📊 Initializing database...");

  // Create connection to MySQL without database selection
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "password",
    multipleStatements: true, // Important for running multiple SQL statements
  });

  try {
    // First try to create the database if it doesn't exist
    console.log(
      `Creating database ${process.env.DB_NAME} if it doesn't exist...`
    );
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`
    );

    // Switch to the database
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Read the schema file
    const schemaPath = path.join(
      __dirname,
      "..",
      "config",
      "init",
      "schema.sql"
    );
    const schemaSQL = fs.readFileSync(schemaPath, "utf8");

    // Execute the schema SQL
    console.log("Creating tables and initial data...");
    await connection.query(schemaSQL);

    console.log("✅ Database initialized successfully!");
  } catch (error) {
    console.error("❌ Error initializing database:", error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run the initialization
initializeDatabase()
  .then(() => {
    console.log("Database setup complete! You can now run the application.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Database setup failed:", err);
    process.exit(1);
  });
