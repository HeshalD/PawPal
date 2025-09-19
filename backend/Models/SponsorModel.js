const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sponsorSchema = new Schema({
  sponsorName: {
    type: String,
    required: true,
    trim: true,
  },
  companyName: {
    type: String,
    required: false,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.[\w\-]+$/, "Invalid email"],
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: false,
    trim: true,
  },
  durationMonths: {
    type: Number,
    enum: [3, 6, 9, 12, 0.001],
    required: true,
  },
  adImagePath: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ["pending", "active", "past", "rejected"],
    default: "pending",
  },
  startDate: {
    type: Date,
    default: null,
  },
  endDate: {
    type: Date,
    default: null,
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

module.exports = mongoose.model("Sponsor", sponsorSchema);


