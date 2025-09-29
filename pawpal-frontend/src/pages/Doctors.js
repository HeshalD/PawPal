import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Doctors() {
  const [list, setList] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    doctorName: '',
    specialization: '',
    availableDate: '',
    availableTime: ''
  });

  async function fetchAll() {
    try {
      const res = await api.get('/doctor-availability');
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
      await api.post('/doctor-availability', form);
      setForm({ doctorName: '', specialization: '', availableDate: '', availableTime: '' });
      await fetchAll();
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <div>
      <h2>Doctors Availability</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={add} style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
        <input placeholder="Doctor Name" value={form.doctorName} onChange={e => setForm({ ...form, doctorName: e.target.value })} />
        <input placeholder="Specialization" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} />
        <input type="date" placeholder="Available Date" value={form.availableDate} onChange={e => setForm({ ...form, availableDate: e.target.value })} />
        <input placeholder="Available Time" value={form.availableTime} onChange={e => setForm({ ...form, availableTime: e.target.value })} />
        <button type="submit">Add Availability</button>
      </form>
      <ul>
        {list.map(d => (
          <li key={d._id} style={{ marginTop: 12 }}>
            <b>{d.doctorName}</b> - {d.specialization} on {new Date(d.availableDate).toLocaleDateString()} at {d.availableTime}
          </li>
        ))}
      </ul>
    </div>
  );
}



