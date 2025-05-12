const express = require("express");
const shopController = require("../controllers/shopController");

const router = express.Router();

// Shop routes
router.post("/", shopController.createShop);
router.get("/", shopController.getShops);
router.get("/:id", shopController.getShopById);
router.put("/:id", shopController.updateShop);
router.delete("/:id", shopController.deleteShop);

module.exports = router;
