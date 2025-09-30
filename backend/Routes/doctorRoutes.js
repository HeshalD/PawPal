const express = require('express');
const router = express.Router();
const doctorController = require('../Controllers/doctorController');

router.post('/', doctorController.addAvailability);
router.get('/', doctorController.getAvailability);

module.exports = router;
