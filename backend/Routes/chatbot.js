const express = require('express');
const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });
    
    const data = await response.json();
    res.json({ response: data.candidates[0].content.parts[0].text });
  } catch (error) {
    res.status(500).json({ error: 'Chatbot error' });
  }
});

module.exports = router;