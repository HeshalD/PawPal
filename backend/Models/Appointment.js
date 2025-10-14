const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  petName: { type: String, required: true },
  ownerName: { type: String, required: true },
  ownerEmail: { type: String, required: true, lowercase: true, trim: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending' 
  },
  reminderSent: { type: Boolean, default: false }
}, {
  timestamps: true // Optional: adds createdAt and updatedAt
});

module.exports = mongoose.model('Appointment', AppointmentSchema);