import { useState } from 'react';
import api from '../api/client';

export default function Chatbot() {
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [error, setError] = useState('');

  async function send(e) {
    e.preventDefault();
    setError('');
    setReply('');
    try {
      const res = await api.post('/chatbot', { message });
      setReply(res.data.reply);
      setMessage('');
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <div>
      <h2>Chatbot</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={send} style={{ display: 'flex', gap: 8 }}>
        <input style={{ flex: 1 }} placeholder="Type your message" value={message} onChange={e => setMessage(e.target.value)} />
        <button type="submit">Send</button>
      </form>
      {reply && <p style={{ marginTop: 12 }}><b>Reply:</b> {reply}</p>}
    </div>
  );
}



