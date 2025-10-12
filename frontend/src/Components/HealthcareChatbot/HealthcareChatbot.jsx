import React, { useState } from 'react';
import { HealthcareChatAPI } from '../../services/healthcareChatAPI';

const HealthcareChatbot = ({ role = 'user', context = '' }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm your PawPal Healthcare Assistant. Ask about vaccinations, doctor availability, appointments, or a pet's health record.", isBot: true, ts: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const suggestions = [
    'What vaccinations does my dog need and when?',
    'Which doctors are available this week?',
    'How do I book an appointment?',
    "Show my pet's latest health record.",
    'When is the next vaccination due?'
  ];

  const intentFallback = (msg) => {
    const m = (msg || '').toLowerCase();
    if (/(hi|hello|hey)\b/.test(m)) {
      return "Hi! How can I help you today? You can ask about vaccinations, doctor availability, appointments, or health records.";
    }
    if (/vaccin|shot|booster/.test(m)) {
      return 'For vaccinations: tell me your pet type and age, and I can outline a typical schedule. In emergencies, contact a vet immediately.';
    }
    if (/appointment|book|schedule/.test(m)) {
      return 'To book an appointment: go to the Appointments page and click Book Appointment, then pick a date, time, and doctor.';
    }
    if (/doctor|availability|available/.test(m)) {
      return 'Doctor availability: ask for a specific day or week, and I will guide you to check available slots.';
    }
    if (/record|health|medical/.test(m)) {
      return "Health records: provide your pet's name or open the Health Records section to view recent visits and treatments.";
    }
    return 'I had trouble responding. Try asking about vaccinations, doctor availability, appointments, or health records.';
  };

  const send = async () => {
    const msg = input.trim();
    if (!msg) return;
    const userMsg = { id: Date.now(), text: msg, isBot: false, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    if (/^(hi|hello|hey)\b/i.test(msg)) {
      setMessages((m) => [...m, { id: Date.now() + 3, text: 'Hi! How can I help you today?', isBot: true, ts: Date.now() }]);
      return;
    }
    setTyping(true);
    try {
      const reply = await HealthcareChatAPI.sendMessage({ message: msg, role, context });
      setMessages((m) => [...m, { id: Date.now() + 1, text: reply, isBot: true, ts: Date.now() }]);
    } catch (e) {
      const fb = intentFallback(msg);
      setMessages((m) => [...m, { id: Date.now() + 2, text: fb, isBot: true, ts: Date.now() }]);
    } finally {
      setTyping(false);
    }
  };

  const sendText = async (text) => {
    setInput(text);
    await new Promise((r) => setTimeout(r, 0));
    await send();
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-emerald-600 text-sm">🐶</span>
              </div>
              <div>
                <h3 className="font-semibold">PawPal Healthcare Assistant</h3>
                <p className="text-xs opacity-90">Online</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-xs px-4 py-2 rounded-2xl ${m.isBot ? 'bg-gray-100 text-gray-800' : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'}`}>
                  <p className="text-sm whitespace-pre-wrap">{m.text}</p>
                </div>
              </div>
            ))}
            {messages.length <= 2 && (
              <div className="grid grid-cols-1 gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendText(s)}
                    className="text-left text-sm px-3 py-2 rounded-xl border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 max-w-xs px-4 py-2 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Ask about vaccinations, doctors..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
              <button onClick={send} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-2 rounded-full hover:from-emerald-600 hover:to-teal-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    </>
  );
};

export default HealthcareChatbot;
