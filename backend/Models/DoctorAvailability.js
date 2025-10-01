const mongoose = require('mongoose');

const DoctorAvailabilitySchema = new mongoose.Schema({
  doctorName: { type: String, required: true },
  availableDate: { type: Date, required: true },
  timeSlots: [{ type: String }], // e.g. ["09:00", "10:00"]
});

module.exports = mongoose.model('DoctorAvailability', DoctorAvailabilitySchema);
