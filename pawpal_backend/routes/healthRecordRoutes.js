// routes/healthRecordRoutes.js
const express = require('express');
const router = express.Router();
const healthRecordController = require('../controllers/healthRecordController');

router.get('/', healthRecordController.getAllRecords);
router.get('/:id', healthRecordController.getRecordById);
router.post('/', healthRecordController.createRecord);
router.put('/:id', healthRecordController.updateRecord);
router.delete('/:id', healthRecordController.deleteRecord);

// Vaccination reminder
router.post('/:id/remind', healthRecordController.sendVaccinationReminder);

// generate pdf 

router.get('/:id/report', healthRecordController.generateMedicalReport);

module.exports = router;
