const mongoose = require('mongoose');

const DoctorAvailabilityEntrySchema = new mongoose.Schema(
  {
    doctorName: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    // time_slot can be a specific time like "10:00", a range like "10:00-18:00", or the keyword "ALL"
    time_slot: { type: String, required: true, trim: true },
    status: { type: String, enum: ['available', 'unavailable'], required: true }
  },
  { timestamps: true, collection: 'doctor_availability' }
);

DoctorAvailabilityEntrySchema.index(
  { doctorName: 1, date: 1, time_slot: 1 },
  { unique: true }
);

module.exports = mongoose.model('DoctorAvailabilityEntry', DoctorAvailabilityEntrySchema);
