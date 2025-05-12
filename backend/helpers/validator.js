/**
 * Validates required fields in a request
 * @param {Object} body - Request body
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} - Validation result with isValid flag and missing fields
 */
const validateFields = (body, requiredFields) => {
  const missingFields = [];

  requiredFields.forEach((field) => {
    if (
      body[field] === undefined ||
      body[field] === null ||
      body[field] === ""
    ) {
      missingFields.push(field);
    }
  });

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

module.exports = {
  validateFields,
};
