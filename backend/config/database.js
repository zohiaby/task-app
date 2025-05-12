const mysql = require("mysql2/promise");
require("dotenv").config();

// Create database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "vendor_shop_management",
  port: parseInt(process.env.DB_PORT) || 3307, // Default to 3307 for Docker mapped port
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000, // 60 second timeout
};

console.log(
  `Attempting to connect to MySQL at ${dbConfig.host}:${dbConfig.port}`
);

// Create pool with better error handling
let pool;
try {
  pool = mysql.createPool(dbConfig);
  console.log("Database pool created");
} catch (error) {
  console.error("Error creating database pool:", error.message);
  // Create a mock pool for graceful degradation
  pool = {
    async getConnection() {
      throw new Error("Database connection unavailable");
    },
    async execute() {
      throw new Error("Database connection unavailable");
    },
    async query() {
      throw new Error("Database connection unavailable");
    },
  };
}

// Test database connection with better error handling and retry logic
async function testConnection(retries = 5, delay = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Connection attempt ${attempt}/${retries}...`);
      const connection = await pool.getConnection();
      console.log("Database connection established successfully");

      // Test query
      await connection.query("SELECT 1 as test");

      connection.release();
      return true;
    } catch (error) {
      console.error(`Connection attempt ${attempt} failed:`, error.message);

      if (attempt < retries) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error(
          "Unable to connect to the database after multiple attempts"
        );
        console.warn(
          "Check your database credentials in .env file or ensure MySQL is running"
        );
        return false;
      }
    }
  }
  return false;
}

// Connection status checker
async function isConnected() {
  try {
    const [rows] = await pool.query("SELECT 1 as test");
    return rows.length > 0;
  } catch (error) {
    return false;
  }
}

module.exports = {
  pool,
  testConnection,
  isConnected,
  config: dbConfig,
};
