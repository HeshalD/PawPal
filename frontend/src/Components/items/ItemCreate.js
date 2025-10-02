import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Nav from "../Nav/NavAdmin"; // Add navigation import

const API_BASE = "http://localhost:5000/items";

function ItemCreate() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [collapsed, setCollapsed] = useState(false); // Add collapsed state
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

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!form.Item_Name || form.Item_Name.trim().length > 5) {
      newErrors.Item_Name = "Item name must be at least 2 characters";
    }

    if (!form.Category) {
      newErrors.Category = "Please select a category";
    }

    if (!form.Unit_of_Measure || form.Unit_of_Measure.trim() === "") {
      newErrors.Unit_of_Measure = "Unit of measure is required";
    }

    if (!form.Quantity || isNaN(form.Quantity) || parseInt(form.Quantity) < 0) {
      newErrors.Quantity = "Quantity must be a non-negative number";
    }

    if (!form.Price || isNaN(form.Price) || parseFloat(form.Price) <= 0) {
      newErrors.Price = "Price must be greater than 0";
    }

    if (image && !image.type.startsWith("image/")) {
      newErrors.Image = "Selected file must be an image";
    }

   
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (saving) return;
    
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
      
      const response = await axios.post(API_BASE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      // Only navigate on successful response
      if (response.status === 200 || response.status === 201) {
        navigate("/items");
      }
    } catch (err) {
      console.error("Create error:", err);
      setError(err.response?.data?.message || "Create failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <Nav collapsed={collapsed} setCollapsed={setCollapsed} />
      
      {/* Main Content - Adjusts based on sidebar state */}
      <div className={`flex-1 transition-all duration-300 ${
        collapsed ? 'ml-20' : 'ml-64'} p-6`}>
        <div className="w-full bg-[#F5F5F5] min-h-screen py-8">
          <div className="w-full max-w-3xl px-4 sm:px-6 lg:px-8 mx-auto">
            <div className="bg-white shadow-lg rounded-lg border border-[#E6F4F3] overflow-hidden">
              <div className="bg-gradient-to-r from-[#6638E6] to-[#E6738F] text-white px-6 py-4">
                <h1 className="text-2xl font-semibold">Add New Item</h1>
                <p className="text-white/80 text-sm">Fill in the details</p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="Item_Name"
                    value={form.Item_Name}
                    onChange={handleChange}
                    className="w-full rounded-md border border-[#E6F4F3] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6638E6]"
                    placeholder="Enter item name"
                    required
                    disabled={saving}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-1">
                    Category *
                  </label>
                  <select
                    name="Category"
                    value={form.Category}
                    onChange={handleChange}
                    className="w-full rounded-md border border-[#E6F4F3] px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#6638E6]"
                    required
                    disabled={saving}
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
                    className="w-full rounded-md border border-[#E6F4F3] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6638E6]"
                    placeholder="Describe the item"
                    rows={4}
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-1">
                    Unit of Measure *
                  </label>
                  <input
                    type="text"
                    name="Unit_of_Measure"
                    value={form.Unit_of_Measure}
                    onChange={handleChange}
                    className="w-full rounded-md border border-[#E6F4F3] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6638E6]"
                    placeholder="e.g., kg, pcs, bottle"
                    required
                    disabled={saving}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="Quantity"
                    value={form.Quantity}
                    onChange={handleChange}
                    className="w-full rounded-md border border-[#E6F4F3] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6638E6]"
                    placeholder="Enter stock quantity"
                    min="0"
                    step="1"
                    required
                    disabled={saving}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-1">
                    Unit Price (Rs) *
                  </label>
                  <input
                    type="number"
                    name="Price"
                    value={form.Price}
                    onChange={handleChange}
                    className="w-full rounded-md border border-[#E6F4F3] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6638E6]"
                    min="1"
                    step="0.01"
                    placeholder="Enter price in Rs"
                    required
                    disabled={saving}
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
                    className="w-full rounded-md border border-[#E6F4F3] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6638E6]"
                    disabled={saving}
                  />
                  {image && (
                    <p className="text-sm text-gray-600 mt-1">Selected: {image.name}</p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => navigate("/items")}
                    className="bg-white text-[#333333] border border-[#E6F4F3] hover:bg-gray-50 px-6 py-2 rounded-md transition-colors"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-gradient-to-r from-[#6638E6] to-[#E6738F] hover:from-[#6638E6] hover:to-[#E69AAE] text-white font-semibold px-6 py-2 rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {saving ? "Creating..." : "Create Item"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemCreate; 