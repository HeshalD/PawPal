const express = require('express');
const router = express.Router();
const doctorController = require('../Controllers/doctorController');

router.post('/', doctorController.addAvailability);
router.get('/', doctorController.getAvailability);

// Restored endpoints for normalized doctor_availability entries (admin usage)
router.post('/entries', doctorController.createEntry);
router.get('/entries', doctorController.listEntries);
router.put('/entries/:id', doctorController.updateEntry);
router.delete('/entries/:id', doctorController.deleteEntry);

// Slots for a specific date across doctors
router.get('/slots', doctorController.getSlotsByDate);

module.exports = router;
