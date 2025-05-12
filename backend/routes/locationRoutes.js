const express = require("express");
const locationController = require("../controllers/locationController");

const router = express.Router();

// Location type routes
router.post("/types", locationController.createLocationType);
router.get("/types", locationController.getLocationTypes);

// Location routes
router.get("/", locationController.getAllLocations); // New route for getting all locations
router.post("/", locationController.createLocation);
router.get("/type/:typeId", locationController.getLocationsByType);
router.get("/:id", locationController.getLocationById);
router.put("/:id", locationController.updateLocation);
router.delete("/:id", locationController.deleteLocation);

module.exports = router;
