const mongoose = require("mongoose");

const FosterSchema = new mongoose.Schema({
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
  notes: { type: String }
});

module.exports = mongoose.model("Foster", FosterSchema);