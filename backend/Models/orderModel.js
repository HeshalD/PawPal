const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  itemPrice: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  totalAmount: {
    type: Number,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "completed", "cancelled"],
    default: "pending"
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  acceptedDate: {
    type: Date
  },
  completedDate: {
    type: Date
  }
});

module.exports = mongoose.model("Order", orderSchema);
