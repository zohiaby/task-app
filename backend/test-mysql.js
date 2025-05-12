const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");

console.log("Starting MySQL connectivity test...");

// Create a direct connection
const connection = mysql.createConnection({
  host: "localhost",
  port: 3307,
  user: "root",
  password: "password",
});

console.log("Connection object created, attempting to connect...");

// Attempt to connect
connection.connect(function (err) {
  if (err) {
    console.error("❌ Error connecting to MySQL:", err);
    if (err.code === "ECONNREFUSED") {
      console.error(
        "Connection refused - check if MySQL is running on port 3307"
      );
    } else if (err.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("Access denied - check username and password");
    }
    process.exit(1);
  }

  console.log("✅ Connected to MySQL successfully!");

  // Create the database if it doesn't exist
  connection.query(
    "CREATE DATABASE IF NOT EXISTS vendor_shop_management",
    function (err) {
      if (err) {
        console.error("❌ Error creating database:", err);
        connection.end();
        process.exit(1);
      }

      console.log(
        "✅ Database vendor_shop_management created or already exists"
      );

      // Switch to the database
      connection.query("USE vendor_shop_management", function (err) {
        if (err) {
          console.error("❌ Error selecting database:", err);
          connection.end();
          process.exit(1);
        }

        console.log("✅ Database selected successfully");

        // Load and run schema.sql content
        const schemaPath = path.join(__dirname, "config", "init", "schema.sql");

        try {
          console.log(`Reading schema file from ${schemaPath}...`);
          const schemaSQL = fs.readFileSync(schemaPath, "utf8");
          console.log("Schema file loaded successfully");

          connection.query(schemaSQL, function (err) {
            if (err) {
              console.error("❌ Error initializing database schema:", err);
            } else {
              console.log("✅ Database schema initialized successfully");
            }

            connection.end();
            console.log("Connection closed. Ready to run the application.");
          });
        } catch (fileErr) {
          console.error("❌ Error reading schema file:", fileErr);
          connection.end();
          process.exit(1);
        }
      });
    }
  );
});
