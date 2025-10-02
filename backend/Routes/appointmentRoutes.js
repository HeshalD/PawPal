const express = require('express');
const router = express.Router();
const appointmentController = require('../Controllers/appointmentController');

router.post('/', appointmentController.bookAppointment);
router.get('/', appointmentController.getAppointments);
router.delete('/:id', appointmentController.deleteAppointment);
router.patch('/:id', appointmentController.updateAppointmentStatus);

module.exports = router;
