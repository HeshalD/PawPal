import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Appointments() {
  const [list, setList] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    petName: '',
    ownerName: '',
    doctorName: '',
    date: '',
    time: ''
  });

  async function fetchAll() {
    try {
      const res = await api.get('/appointments');
      setList(res.data);
    } catch (e) {
      setError(String(e));
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  async function add(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/appointments', form);
      setForm({ petName: '', ownerName: '', doctorName: '', date: '', time: '' });
      await fetchAll();
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <div>
      <h2>Appointments</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={add} style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
        <input placeholder="Pet Name" value={form.petName} onChange={e => setForm({ ...form, petName: e.target.value })} />
        <input placeholder="Owner Name" value={form.ownerName} onChange={e => setForm({ ...form, ownerName: e.target.value })} />
        <input placeholder="Doctor Name" value={form.doctorName} onChange={e => setForm({ ...form, doctorName: e.target.value })} />
        <input type="date" placeholder="Date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
        <input placeholder="Time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
        <button type="submit">Book Appointment</button>
      </form>
      <ul>
        {list.map(a => (
          <li key={a._id} style={{ marginTop: 12 }}>
            <b>{a.petName}</b> with Dr. {a.doctorName} on {new Date(a.date).toLocaleDateString()} at {a.time}
          </li>
        ))}
      </ul>
    </div>
  );
}



