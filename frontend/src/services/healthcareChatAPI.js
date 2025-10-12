const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

export const HealthcareChatAPI = {
  sendMessage: async ({ message, role = 'user', context = '' }) => {
    if (!API_KEY) {
      throw new Error('Missing REACT_APP_GEMINI_API_KEY');
    }
    const systemPreamble =
      "You are PawPal Healthcare Assistant for a veterinary management system.\n" +
      "Answer concisely. For emergencies, advise contacting a vet immediately.\n" +
      "Topics: appointments, doctor availability, vaccinations, and pet health records.\n";
    const composed = `${systemPreamble}\nRole: ${role}\nContext: ${context}\nUser: ${message}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
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

    if (!res.ok) {
      const t = await res.text().catch(() => '');
      throw new Error(`Gemini API error: ${res.status} ${t}`);
    }
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
  }
};
