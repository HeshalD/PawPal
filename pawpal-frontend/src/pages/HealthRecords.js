import { useEffect, useState } from 'react';
import api from '../api/client';

export default function HealthRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    petName: '',
    ownerName: '',
    ownerEmail: '',
    petType: '',
    diagnosis: '',
    treatment: '',
    vaccination: '',
    nextVaccinationDate: ''
  });

  async function fetchRecords() {
    try {
      setLoading(true);
      const res = await api.get('/health-records');
      setRecords(res.data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRecords();
  }, []);

  async function createRecord(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/health-records', form);
      setForm({
        petName: '', ownerName: '', ownerEmail: '', petType: '',
        diagnosis: '', treatment: '', vaccination: '', nextVaccinationDate: ''
      });
      await fetchRecords();
    } catch (e) {
      setError(String(e));
    }
  }

  async function deleteRecord(id) {
    try {
      await api.delete(`/health-records/${id}`);
      await fetchRecords();
    } catch (e) {
      setError(String(e));
    }
  }

  async function remind(id) {
    try {
      await api.post(`/health-records/${id}/remind`);
      alert('Reminder sent');
    } catch (e) {
      setError(String(e));
    }
  }

  function downloadReport(id) {
    window.open(`/health-records/${id}/report`, '_blank');
  }

  return (
    <div>
      <h2>Health Records</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={createRecord} style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
        <input placeholder="Pet Name" value={form.petName} onChange={e => setForm({ ...form, petName: e.target.value })} />
        <input placeholder="Owner Name" value={form.ownerName} onChange={e => setForm({ ...form, ownerName: e.target.value })} />
        <input placeholder="Owner Email" value={form.ownerEmail} onChange={e => setForm({ ...form, ownerEmail: e.target.value })} />
        <input placeholder="Pet Type" value={form.petType} onChange={e => setForm({ ...form, petType: e.target.value })} />
        <input placeholder="Diagnosis" value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} />
        <input placeholder="Treatment" value={form.treatment} onChange={e => setForm({ ...form, treatment: e.target.value })} />
        <input placeholder="Vaccination" value={form.vaccination} onChange={e => setForm({ ...form, vaccination: e.target.value })} />
        <input type="date" placeholder="Next Vaccination Date" value={form.nextVaccinationDate} onChange={e => setForm({ ...form, nextVaccinationDate: e.target.value })} />
        <button type="submit">Create Record</button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {records.map(r => (
            <li key={r._id} style={{ marginTop: 12 }}>
              <b>{r.petName}</b> - {r.ownerName} ({r.petType})
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button onClick={() => remind(r._id)}>Send Reminder</button>
                <button onClick={() => downloadReport(r._id)}>Download Report</button>
                <button onClick={() => deleteRecord(r._id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}



