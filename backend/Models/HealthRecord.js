// models/HealthRecord.js
const mongoose = require('mongoose');

const HealthRecordSchema = new mongoose.Schema({
  petName: { type: String, required: true },
  ownerName: { type: String, required: true },
  ownerEmail: { type: String, required: true }, // add email to send reminders
  petType: { type: String, required: true },
  diagnosis: { type: String, required: true },
  treatment: { type: String, required: true },
  vaccination: { type: String },
  visitDate: { type: Date, default: Date.now },
  nextVaccinationDate: { type: Date },
});

module.exports = mongoose.model('HealthRecord', HealthRecordSchema);
