const { formatError } = require("../helpers/responseFormatter");

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const errorResponse = formatError(message, statusCode);

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
