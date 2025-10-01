// routes/chatbotRoutes.js
const express = require('express');
const router = express.Router();
const chatbotController = require('../Controllers/chatbotController');

router.post('/', chatbotController.chatbotResponse);

module.exports = router;
