const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors"); // Import cors

// Load environment variables
dotenv.config();

// Import routes
const locationRoutes = require("./routes/locationRoutes");
const shopRoutes = require("./routes/shopRoutes");

// Import middlewares
const errorHandler = require("./middlewares/errorHandler");
const rateLimiter = require("./middlewares/rateLimiter");

// Create Express app
const app = express();

// CORS configuration - enabling cross-origin requests
app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow cookies to be sent with requests
    exposedHeaders: [
      "Content-Length",
      "X-RateLimit-Limit",
      "X-RateLimit-Remaining",
    ],
  })
);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Apply rate limiting to all routes
app.use(rateLimiter);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Debug route to test router functionality
app.get("/debug", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Debug route is working",
    availableRoutes: {
      health: "/health",
      locations: "/api/locations",
      shops: "/api/shops",
    },
  });
});

// API Routes
app.use("/api/locations", locationRoutes);
app.use("/api/shops", shopRoutes);

// 404 handler
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Global error handler
app.use(errorHandler);

module.exports = app;
