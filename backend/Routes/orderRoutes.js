const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  getOrdersByStatus
} = require("../Controllers/orderController");

// Get all orders
router.get("/", getAllOrders);

// Get orders by status
router.get("/status/:status", getOrdersByStatus);

// Get order by ID
router.get("/:id", getOrderById);

// Create new order
router.post("/", createOrder);

// Update order status
router.patch("/:id", updateOrderStatus);

// Delete order
router.delete("/:id", deleteOrder);

module.exports = router;
