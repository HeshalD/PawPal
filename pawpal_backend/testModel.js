// testModel.js
const mongoose = require('mongoose');

const HealthRecordSchema = new mongoose.Schema({
  petName: { type: String, required: true },
  ownerName: { type: String, required: true }
});

const HealthRecord = mongoose.model('HealthRecord', HealthRecordSchema);

console.log('HealthRecord model is:', HealthRecord);
console.log('Type of HealthRecord:', typeof HealthRecord);
