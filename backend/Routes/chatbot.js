const express = require('express');
const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { message = '', role = 'user', context = '' } = req.body || {};
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Missing Gemini API key on server' });
    }
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemPreamble =
      'You are PawPal Healthcare Assistant for a veterinary management system.\n' +
      'Be concise and helpful. If asked about medical emergencies, advise contacting a vet immediately.\n' +
      'If asked about appointments, availability, vaccinations, or health records, provide guidance.\n';

    const composed = `${systemPreamble}\nRole: ${role}\nContext: ${context}\nUser: ${message}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: composed }]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 0.95,
            maxOutputTokens: 512
          }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return res.status(502).json({ error: `Gemini API error`, details: errText });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
    res.json({ response: text });
  } catch (error) {
    res.status(500).json({ error: 'Chatbot error' });
  }
});

module.exports = router;