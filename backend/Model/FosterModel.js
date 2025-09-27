const mongoose = require("mongoose");

const fosterSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    contact: { type: String, required: true },
    email: { type: String, required: true },
    animalName: { type: String, required: true },
    animalType: { type: String, required: true },
    fosterFrom: { type: String, required: true },
    fosterTo: { type: String, required: true },
    experience: { type: String, required: true },
    homeEnvironment: { type: String },
    notes: { type: String },
    // New status field with enum and default
    status: {
      type: String,
      enum: ["pending", "approved", "completed"],
      default: "pending",
      required: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Foster", fosterSchema);