import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/items';

function ItemEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    Item_Name: '',
    Category: '',
    Description: '',
    Unit_of_Measure: '',
    Quantity: '',
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    axios.get(`${API_BASE}/${id}`)
      .then((res) => {
        if (!mounted) return;
        const { item } = res.data || {};
        setForm({
          Item_Name: item?.Item_Name || '',
          Category: item?.Category || '',
          Description: item?.Description || '',
          Unit_of_Measure: item?.Unit_of_Measure || '',
          Quantity: item?.Quantity ?? '',
        });
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setError('Failed to load item');
        setLoading(false);
      });
    return () => { mounted = false; };
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await axios.put(`${API_BASE}/${id}`, form);
      navigate('/items');
    } catch (err) {
      setError('Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full bg-[#F5F5F5] min-h-screen py-8">
      <div className="w-full max-w-3xl px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="bg-white shadow-lg rounded-lg border border-[#E6F4F3] overflow-hidden">
          <div className="bg-[#4CB5AE] text-white px-6 py-4">
            <h1 className="text-2xl font-semibold">Update Item</h1>
            <p className="text-white/80 text-sm">ID: {id}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-[#FFBFCB] text-[#333333] px-4 py-2 rounded">{error}</div>
            )}
            {loading ? (
              <div className="text-[#333333]">Loading...</div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-1">Name</label>
                  <input
                    type="text"
                    name="Item_Name"
                    value={form.Item_Name}
                    onChange={handleChange}
                    className="w-full rounded-md border border-[#E6F4F3] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7EC8E3]"
                    placeholder="Enter item name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-1">Category</label>
                  <input
                    type="text"
                    name="Category"
                    value={form.Category}
                    onChange={handleChange}
                    className="w-full rounded-md border border-[#E6F4F3] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7EC8E3]"
                    placeholder="Enter category"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-1">Description</label>
                  <textarea
                    name="Description"
                    value={form.Description}
                    onChange={handleChange}
                    className="w-full rounded-md border border-[#E6F4F3] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7EC8E3]"
                    placeholder="Describe the item"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    name="Unit_of_Measure"
                    value={form.Unit_of_Measure}
                    onChange={handleChange}
                    className="w-full rounded-md border border-[#E6F4F3] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7EC8E3]"
                    placeholder="e.g., kg, pcs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-1">Quantity</label>
                  <input
                    type="number"
                    name="Quantity"
                    value={form.Quantity}
                    onChange={handleChange}
                    className="w-full rounded-md border border-[#E6F4F3] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7EC8E3]"
                    placeholder="Enter stock quantity"
                    min="0"
                    step="1"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/items')}
                    className="bg-white text-[#333333] border border-[#E6F4F3] hover:bg-[#F5F5F5] px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-[#FFA45B] hover:bg-[#ff9237] text-[#333333] font-semibold px-5 py-2 rounded-md shadow-sm disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default ItemEdit;

