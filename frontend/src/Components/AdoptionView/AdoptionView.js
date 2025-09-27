import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Update this with your backend API URL
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/adoptions';

export default function AdoptionView() {
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    adopterName: '',
    petName: '',
    contact: '',
    adoptionDate: '',
    notes: '',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdoptions();
  }, []);

  const fetchAdoptions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(BASE_URL);
      setAdoptions(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load adoption records.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (!form.adopterName || !form.petName) {
        setError('Adopter name and pet name are required.');
        return;
      }
      await axios.post(BASE_URL, form);
      setShowForm(false);
      setForm({ adopterName: '', petName: '', contact: '', adoptionDate: '', notes: '' });
      fetchAdoptions();
    } catch (err) {
      console.error(err);
      setError('Failed to add adoption.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await axios.delete(`${BASE_URL}/${id}`);
      fetchAdoptions();
    } catch (err) {
      console.error(err);
      setError('Failed to delete adoption record.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Adoption Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-green-300"
        >
          Add Adoption
        </button>
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      {/* Adoption List */}
      <div className="bg-white rounded-lg shadow divide-y">
        {loading ? (
          <p className="p-4 text-gray-500">Loading...</p>
        ) : adoptions.length === 0 ? (
          <p className="p-4 text-gray-500">No adoption records found.</p>
        ) : (
          adoptions.map((a) => (
            <div key={a._id || a.id} className="p-4 flex items-start justify-between">
              <div>
                <p className="font-semibold text-lg">{a.adopterName} <span className="text-gray-600">→ {a.petName}</span></p>
                <p className="text-sm text-gray-500">Contact: {a.contact || '—'}</p>
                <p className="text-sm text-gray-500">Date: {a.adoptionDate || '—'}</p>
                {a.notes && <p className="text-sm text-gray-500">Notes: {a.notes}</p>}
              </div>
              <button
                onClick={() => handleDelete(a._id || a.id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Adoption Form */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Add New Adoption</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="adopterName"
                placeholder="Adopter Name"
                value={form.adopterName}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                name="petName"
                placeholder="Pet Name"
                value={form.petName}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                name="contact"
                placeholder="Contact Info"
                value={form.contact}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
              <input
                type="date"
                name="adoptionDate"
                value={form.adoptionDate}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
              <textarea
                name="notes"
                placeholder="Notes"
                value={form.notes}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
