const express = require("express");
const router = express.Router();

// Insert controller
const inventoryController = require("../Controllers/inventoryControllers ");
const upload = require('../middleware/upload');

// Routes
router.get("/", inventoryController.getAllItem);
router.post("/", upload.single('image'), inventoryController.addItem);
router.get("/:id", inventoryController.getById);
router.put("/:id", inventoryController.updateItem);
router.delete("/:id", inventoryController.deleteItem );

module.exports = router;
 