const LocationModel = require("../models/location");
const { formatResponse, formatError } = require("../helpers/responseFormatter");
const { validateFields } = require("../helpers/validator");
const asyncHandler = require("../middlewares/asyncHandler");

/**
 * Location Controller - Handles location-related API requests
 */

// Create a new location type
const createLocationType = asyncHandler(async (req, res) => {
  const { name, order } = req.body;

  // Validate required fields
  const validation = validateFields(req.body, ["name", "order"]);
  if (!validation.isValid) {
    return res
      .status(400)
      .json(
        formatError(
          `Missing required fields: ${validation.missingFields.join(", ")}`,
          400
        )
      );
  }

  const locationTypeId = await LocationModel.createLocationType(name, order);

  res.status(201).json(
    formatResponse(true, "Location type created successfully", {
      id: locationTypeId,
      name,
      order,
    })
  );
});

// Get all locations
const getAllLocations = asyncHandler(async (req, res) => {
  const locations = await LocationModel.getAllLocations();

  res
    .status(200)
    .json(
      formatResponse(true, "All locations retrieved successfully", locations)
    );
});

// Get all location types
const getLocationTypes = asyncHandler(async (req, res) => {
  const locationTypes = await LocationModel.getAllLocationTypes();

  res
    .status(200)
    .json(
      formatResponse(
        true,
        "Location types retrieved successfully",
        locationTypes
      )
    );
});

// Create a new location
const createLocation = asyncHandler(async (req, res) => {
  const { typeId, name, parentId } = req.body;

  // Validate required fields
  const validation = validateFields(req.body, ["typeId", "name"]);
  if (!validation.isValid) {
    return res
      .status(400)
      .json(
        formatError(
          `Missing required fields: ${validation.missingFields.join(", ")}`,
          400
        )
      );
  }

  const locationId = await LocationModel.createLocation(
    typeId,
    name,
    parentId || null
  );

  res.status(201).json(
    formatResponse(true, "Location created successfully", {
      id: locationId,
      typeId,
      name,
      parentId,
    })
  );
});

// Get locations by type
const getLocationsByType = asyncHandler(async (req, res) => {
  const { typeId } = req.params;
  const { parentId } = req.query;

  const locations = await LocationModel.getLocationsByType(
    typeId,
    parentId ? parseInt(parentId, 10) : null
  );

  res
    .status(200)
    .json(formatResponse(true, "Locations retrieved successfully", locations));
});

// Get location by ID
const getLocationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const location = await LocationModel.getLocationById(id);

  if (!location) {
    return res.status(404).json(formatError("Location not found", 404));
  }

  // Get location path (hierarchy)
  const locationPath = await LocationModel.getLocationPath(id);
  location.path = locationPath;

  res
    .status(200)
    .json(formatResponse(true, "Location retrieved successfully", location));
});

// Update a location
const updateLocation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, typeId, parentId } = req.body;

  // Validate required fields
  const validation = validateFields(req.body, ["name", "typeId"]);
  if (!validation.isValid) {
    return res
      .status(400)
      .json(
        formatError(
          `Missing required fields: ${validation.missingFields.join(", ")}`,
          400
        )
      );
  }

  // Check if location exists
  const location = await LocationModel.getLocationById(id);
  if (!location) {
    return res.status(404).json(formatError("Location not found", 404));
  }

  // Update the location
  const updated = await LocationModel.updateLocation(id, {
    name,
    typeId,
    parentId: parentId || null,
  });

  if (!updated) {
    return res.status(400).json(formatError("Failed to update location", 400));
  }

  res.status(200).json(
    formatResponse(true, "Location updated successfully", {
      id,
      name,
      typeId,
      parentId,
    })
  );
});

// Delete a location
const deleteLocation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if location exists
  const location = await LocationModel.getLocationById(id);
  if (!location) {
    return res.status(404).json(formatError("Location not found", 404));
  }

  try {
    // Try to delete the location
    await LocationModel.deleteLocation(id);

    res
      .status(200)
      .json(formatResponse(true, "Location deleted successfully", null));
  } catch (error) {
    // Handle specific error cases from model
    return res.status(400).json(formatError(error.message, 400));
  }
});

module.exports = {
  createLocationType,
  getLocationTypes,
  createLocation,
  getLocationsByType,
  getLocationById,
  updateLocation,
  deleteLocation,
  getAllLocations,
};
