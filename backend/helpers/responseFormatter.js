/**
 * Standard response formatter for API responses
 */
const formatResponse = (
  success = true,
  message = "",
  data = null,
  statusCode = 200
) => {
  return {
    success,
    message,
    data,
    statusCode,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Error response formatter
 */
const formatError = (
  message = "An error occurred",
  statusCode = 500,
  errors = null
) => {
  return formatResponse(false, message, errors, statusCode);
};

module.exports = {
  formatResponse,
  formatError,
};
