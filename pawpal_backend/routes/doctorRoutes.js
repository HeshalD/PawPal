const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

router.post('/', doctorController.addAvailability);
router.get('/', doctorController.getAvailability);

module.exports = router;
