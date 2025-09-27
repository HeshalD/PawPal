const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const donationSchema = new Schema({
  fullname: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  NIC: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
  },
  Address: {
    type: String,
    required: true,
  },
  ContributionType: {
    type: String,
    required: true,
  },
  Amount: {
    type: Number,
    required: true,
  },
  Currency: {
    type: String,
    required: true,
  },
  PaymentMethod: {
    type: String,
    required: true,
  },
  donationFrequency: {
    type: String,
    enum: ['monthly', 'yearly', 'weekly', 'one-time'],
    required: true,
  },
  slipUpload: {
    type: String, // File path or URL
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Donation", donationSchema);