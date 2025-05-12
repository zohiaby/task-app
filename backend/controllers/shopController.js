const ShopModel = require("../models/shop");
const { formatResponse, formatError } = require("../helpers/responseFormatter");
const { validateFields } = require("../helpers/validator");
const asyncHandler = require("../middlewares/asyncHandler");

/**
 * Shop Controller - Handles shop-related API requests
 */

// Create a new shop
const createShop = asyncHandler(async (req, res) => {
  const { title, type, latitude, longitude, status, locationIds } = req.body;

  // Validate required fields
  const validation = validateFields(req.body, [
    "title",
    "type",
    "latitude",
    "longitude",
  ]);
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

  // Create the shop
  const shopId = await ShopModel.createShop({
    title,
    type,
    latitude,
    longitude,
    status: status || "active",
  });

  // Assign locations if provided
  if (locationIds && Array.isArray(locationIds) && locationIds.length > 0) {
    await ShopModel.assignShopLocations(shopId, locationIds);
  }

  res
    .status(201)
    .json(
      formatResponse(true, "Shop created successfully", {
        id: shopId,
        title,
        type,
        latitude,
        longitude,
        status: status || "active",
        locationIds,
      })
    );
});

// Get all shops with optional filtering
const getShops = asyncHandler(async (req, res) => {
  const { type, status, locationId, page = 1, limit = 10 } = req.query;

  const filters = {};
  if (type) filters.type = type;
  if (status) filters.status = status;
  if (locationId) filters.locationId = parseInt(locationId, 10);

  const result = await ShopModel.getShops(
    filters,
    parseInt(page, 10),
    parseInt(limit, 10)
  );

  res
    .status(200)
    .json(formatResponse(true, "Shops retrieved successfully", result));
});

// Get shop by ID
const getShopById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const shop = await ShopModel.getShopById(id);

  if (!shop) {
    return res.status(404).json(formatError("Shop not found", 404));
  }

  res
    .status(200)
    .json(formatResponse(true, "Shop retrieved successfully", shop));
});

// Update a shop
const updateShop = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, type, latitude, longitude, status, locationIds } = req.body;

  // Validate required fields
  const validation = validateFields(req.body, [
    "title",
    "type",
    "latitude",
    "longitude",
    "status",
  ]);
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

  // Check if shop exists
  const shop = await ShopModel.getShopById(id);
  if (!shop) {
    return res.status(404).json(formatError("Shop not found", 404));
  }

  // Update the shop
  const updated = await ShopModel.updateShop(id, {
    title,
    type,
    latitude,
    longitude,
    status,
  });

  if (!updated) {
    return res.status(400).json(formatError("Failed to update shop", 400));
  }

  // Update shop locations if provided
  if (locationIds && Array.isArray(locationIds)) {
    await ShopModel.assignShopLocations(id, locationIds);
  }

  res
    .status(200)
    .json(
      formatResponse(true, "Shop updated successfully", {
        id,
        title,
        type,
        latitude,
        longitude,
        status,
        locationIds,
      })
    );
});

// Delete a shop
const deleteShop = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if shop exists
  const shop = await ShopModel.getShopById(id);
  if (!shop) {
    return res.status(404).json(formatError("Shop not found", 404));
  }

  // Delete the shop
  const deleted = await ShopModel.deleteShop(id);

  if (!deleted) {
    return res.status(400).json(formatError("Failed to delete shop", 400));
  }

  res.status(200).json(formatResponse(true, "Shop deleted successfully", null));
});

module.exports = {
  createShop,
  getShops,
  getShopById,
  updateShop,
  deleteShop,
};
