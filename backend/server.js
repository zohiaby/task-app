const app = require("./app");
const { testConnection, isConnected } = require("./config/database");
const redis = require("./config/redis");
// Flag to track if we've shown the "running without DB" warning
let dbWarningShown = false;

// Get port from environment or use default
const PORT = process.env.PORT || 5000;

// Start the server regardless of database connectivity
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Test database connection but don't prevent server from starting
testConnection()
  .then((connected) => {
    if (!connected) {
      console.warn("⚠️ Application is running without database connectivity");
      console.warn("👉 Some features may be unavailable");
      dbWarningShown = true;
    }
  })
  .catch((err) => {
    console.error("Database connection test failed:", err.message);
    console.warn("⚠️ Application is running without database connectivity");
    console.warn("👉 Some features may be unavailable");
    dbWarningShown = true;
  });

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Details:");
  console.error(err.name, err.message);

  // Don't crash the server unless it's a critical error
  if (err.fatal) {
    console.error("Fatal error detected. Shutting down...");
    server.close(() => {
      process.exit(1);
    });
  }
});

// Handle SIGTERM signal
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});

// Periodically check database connectivity and report when it comes back online
if (process.env.NODE_ENV !== "production") {
  const checkInterval = 30000; // 30 seconds

  setInterval(async () => {
    try {
      const connected = await isConnected();

      if (connected && dbWarningShown) {
        console.log("✅ Database connection has been established");
        dbWarningShown = false;
      } else if (!connected && !dbWarningShown) {
        console.warn("⚠️ Lost connection to database");
        dbWarningShown = true;
      }
    } catch (error) {
      // Ignore errors in the periodic check
    }
  }, checkInterval);
}
