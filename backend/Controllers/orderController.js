const Order = require("../Models/orderModel");
const mongoose = require("mongoose");
const Inventory = require("../Models/inventoryModel");

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
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    const order = await Order.findById(id);
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
  const session = await mongoose.startSession();
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

    // Ensure quantities are positive integers
    for (const it of orderData.items) {
      if (!it?.itemId || !Number.isFinite(Number(it.quantity)) || Number(it.quantity) <= 0) {
        return res.status(400).json({ message: "Each item must include a valid itemId and positive quantity" });
      }
    }

    // Start transaction for stock decrement + order save
    await session.withTransaction(async () => {
      // Load current inventory for items in the order
      const ids = orderData.items.map(i => i.itemId);
      const inventoryDocs = await Inventory.find({ _id: { $in: ids } }).session(session);

      // Map by id for quick lookup
      const invById = new Map(inventoryDocs.map(doc => [String(doc._id), doc]));

      // Validate availability
      for (const it of orderData.items) {
        const doc = invById.get(String(it.itemId));
        if (!doc) {
          throw new Error(`Item not found: ${it.itemId}`);
        }
        const available = Number(doc.Quantity || 0);
        if (available < it.quantity) {
          const err = new Error(`Insufficient stock for ${doc.Item_Name}. Available: ${available}, requested: ${it.quantity}`);
          err.code = 'INSUFFICIENT_STOCK';
          throw err;
        }
      }

      // Decrement stock using bulkWrite under the same session
      const ops = orderData.items.map(it => ({
        updateOne: {
          filter: { _id: it.itemId, Quantity: { $gte: it.quantity } },
          update: { $inc: { Quantity: -it.quantity } }
        }
      }));
      const bulk = await Inventory.bulkWrite(ops, { session });

      // Verify that all updates matched a document (concurrent protection)
      const matched = Object.values(bulk.result?.nMatched || {}).reduce?.((a,b)=>a+b, 0) || bulk.matchedCount || 0;
      if (matched < orderData.items.length) {
        const err = new Error('Stock update conflict. Please try again.');
        err.code = 'STOCK_CONFLICT';
        throw err;
      }

      // Generate unique order ID and save order
      const orderId = generateOrderId();
      const order = new Order({ ...orderData, orderId });
      await order.save({ session });

      // Respond inside transaction scope is okay after awaited writes
      res.status(201).json({ message: "Order created successfully", order });
    });
  } catch (error) {
    if (error?.code === 'INSUFFICIENT_STOCK') {
      return res.status(409).json({ message: error.message });
    }
    if (error?.code === 'STOCK_CONFLICT') {
      return res.status(409).json({ message: 'Stock changed during checkout. Please refresh and try again.' });
    }
    if (error && error.code === 11000) {
      // Duplicate order ID, retry with new ID
      return createOrder(req, res);
    }
    res.status(500).json({ message: "Failed to create order", error: error.message });
  } finally {
    session.endSession();
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
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
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    const order = await Order.findByIdAndDelete(id);
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
