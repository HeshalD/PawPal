import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:5000/items";

function ItemCreate() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    Item_Name: "",
    Category: "",
    Description: "",
    Unit_of_Measure: "",
    Quantity: "",
    Price: "",
  });
  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (image) {
        formData.append("image", image);
      }
      await axios.post(API_BASE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/items");
    } catch (err) {
      setError("Create failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full bg-[#F5F5F5] min-h-screen py-8">
      <div className="w-full max-w-3xl px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="bg-white shadow-lg rounded-lg border border-[#E6F4F3] overflow-hidden">
          <div className="bg-[#4CB5AE] text-white px-6 py-4">
            <h1 className="text-2xl font-semibold">Add New Item</h1>
            <p className="text-white/80 text-sm">Fill in the details</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-[#FFBFCB] text-[#333333] px-4 py-2 rounded">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-[#333333] mb-1">
                Name
              </label>
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
              <label className="block text-sm font-medium text-[#333333] mb-1">
                Category
              </label>
              <select
                name="Category"
                value={form.Category}
                onChange={handleChange}
                className="w-full rounded-md border border-[#E6F4F3] px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#7EC8E3]"
                required
              >
                <option value="" disabled>Select category</option>
                <option value="Pet food">Pet food</option>
                <option value="Medicine">Medicine</option>
                <option value="Accessories">Accessories</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#333333] mb-1">
                Description
              </label>
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
              <label className="block text-sm font-medium text-[#333333] mb-1">
                Unit of Measure
              </label>
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
              <label className="block text-sm font-medium text-[#333333] mb-1">
                Quantity
              </label>
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
            {/*
            <div>
              <label className="block text-sm font-medium text-[#333333] mb-1">Price</label>
              <input
                type="number"
                name="Price"
                value={form.Price}
                onChange={handleChange}
                className="w-full rounded-md border border-[#E6F4F3] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7EC8E3]"
                placeholder="Enter price"
                min="100"
                step="100"
                required
              />
            </div> */}
            <div className="relative">
              <label className="block text-sm font-medium text-[#333333] mb-1">
                Price
              </label>
              <input
                type="number"
                name="Price"
                value={form.Price}
                onChange={handleChange}
                className="w-full rounded-md border border-[#E6F4F3] px-10 py-2 focus:outline-none focus:ring-2 focus:ring-[#7EC8E3]"
                min="100"
                step="1"
                placeholder ="Rs."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#333333] mb-1">
                Image
              </label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full rounded-md border border-[#E6F4F3] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7EC8E3]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/items")}
                className="bg-white text-[#333333] border border-[#E6F4F3] hover:bg-[#F5F5F5] px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-[#FFA45B] hover:bg-[#ff9237] text-[#333333] font-semibold px-5 py-2 rounded-md shadow-sm disabled:opacity-60"
              >
                {saving ? "Creating..." : "Create Item"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ItemCreate;
