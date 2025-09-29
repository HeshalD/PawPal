const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  petName: { type: String, required: true },
  ownerName: { type: String, required: true },
  doctorName: { type: String, required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
