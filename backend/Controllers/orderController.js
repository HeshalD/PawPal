const Order = require("../Models/orderModel");

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderDate: -1 });
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order", error: error.message });
  }
};

// Generate unique order ID
const generateOrderId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `PP-${timestamp}-${random}`.toUpperCase();
};

// Create new order
const createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    
    // Validate required fields
    const requiredFields = [
      'items', 'totalAmount', 'customerName', 'customerEmail', 'customerPhone', 'deliveryAddress'
    ];
    
    for (const field of requiredFields) {
      if (!orderData[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    // Validate items array
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      return res.status(400).json({ message: "Items array is required and must not be empty" });
    }

    // Generate unique order ID
    const orderId = generateOrderId();
    
    // Create order with generated ID
    const order = new Order({
      ...orderData,
      orderId: orderId
    });
    
    await order.save();
    
    res.status(201).json({ 
      message: "Order created successfully", 
      order 
    });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate order ID, retry with new ID
      return createOrder(req, res);
    }
    res.status(500).json({ message: "Failed to create order", error: error.message });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !["pending", "accepted", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updateData = { status };
    
    // Add timestamp based on status
    if (status === "accepted") {
      updateData.acceptedDate = new Date();
    } else if (status === "completed") {
      updateData.completedDate = new Date();
    }

    const order = await Order.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ 
      message: "Order status updated successfully", 
      order 
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update order", error: error.message });
  }
};

// Delete order
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete order", error: error.message });
  }
};

// Get orders by status
const getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const orders = await Order.find({ status }).sort({ orderDate: -1 });
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  getOrdersByStatus
};
