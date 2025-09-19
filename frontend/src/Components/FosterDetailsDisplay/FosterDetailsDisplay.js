import React, { useEffect, useState } from "react";
import axios from "axios";

const URL = "http://localhost:5001/fosters";

export default function FosterDetailsDisplay() {
  const [fosters, setFosters] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [search, setSearch] = useState("");

  const fetchFosters = () => {
    axios
      .get(URL)
      .then((res) => setFosters(res.data.fosters || []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchFosters();
  }, []);

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditData({ ...item });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const onEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`${URL}/${id}`, editData);
      setEditingId(null);
      setEditData({});
      fetchFosters();
    } catch (err) {
      console.error(err);
      alert("Failed to update. Please try again.");
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this foster request?")) return;
    try {
      await axios.delete(`${URL}/${id}`);
      setFosters((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete. Please try again.");
    }
  };

  // filter fosters based on search
  const filteredFosters = fosters.filter(
    (f) =>
      f.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      f.animalName?.toLowerCase().includes(search.toLowerCase()) ||
      f.animalType?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-10">
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-4xl font-extrabold mb-8 text-center text-gray-800 drop-shadow-lg">
          🐾 Foster Requests
        </h2>

        {/* Search bar */}
        <div className="flex justify-center mb-8">
          <input
            type="text"
            placeholder="Search by name or animal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-1/2 p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>

        {!filteredFosters || filteredFosters.length === 0 ? (
          <p className="text-center text-gray-500">No foster requests found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFosters.map((item) => (
              <div
                key={item._id || item.id}
                className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100 hover:shadow-2xl transition duration-300 relative"
              >
                {editingId === (item._id || item.id) ? (
                  <div className="space-y-3">
                    <input
                      name="fullName"
                      value={editData.fullName || ""}
                      onChange={onEditChange}
                      placeholder="Full Name"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                      name="address"
                      value={editData.address || ""}
                      onChange={onEditChange}
                      placeholder="Address"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                      name="contact"
                      value={editData.contact || ""}
                      onChange={onEditChange}
                      placeholder="Contact Number"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                      name="email"
                      value={editData.email || ""}
                      onChange={onEditChange}
                      placeholder="Email"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                      name="animalName"
                      value={editData.animalName || ""}
                      onChange={onEditChange}
                      placeholder="Animal Name"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                      name="animalType"
                      value={editData.animalType || ""}
                      onChange={onEditChange}
                      placeholder="Animal Type"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
                    />
                    <div className="flex gap-3">
                      <input
                        type="date"
                        name="fosterFrom"
                        value={editData.fosterFrom || ""}
                        onChange={onEditChange}
                        className="w-1/2 p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
                      />
                      <input
                        type="date"
                        name="fosterTo"
                        value={editData.fosterTo || ""}
                        onChange={onEditChange}
                        className="w-1/2 p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <select
                      name="experience"
                      value={editData.experience || "No"}
                      onChange={onEditChange}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                    <input
                      name="homeEnvironment"
                      value={editData.homeEnvironment || ""}
                      onChange={onEditChange}
                      placeholder="Home Environment"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
                    />
                    <textarea
                      name="notes"
                      value={editData.notes || ""}
                      onChange={onEditChange}
                      placeholder="Additional Notes"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
                      rows="2"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => saveEdit(item._id || item.id)}
                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-5 rounded-lg shadow transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-5 rounded-lg shadow transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-bold mb-3 text-gray-800">
                      {item.fullName}
                    </h3>
                    <div className="space-y-2">
                      <p className="text-gray-600">
                        <span className="font-semibold">Address:</span> {item.address}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Contact:</span> {item.contact}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Email:</span> {item.email}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Animal Name/ID:</span> {item.animalName}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Animal Type:</span> {item.animalType}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Foster Duration:</span> {item.fosterFrom} → {item.fosterTo}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Experience:</span> {item.experience}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Home Environment:</span> {item.homeEnvironment}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Notes:</span> {item.notes}
                      </p>
                    </div>
                    <div className="flex gap-3 mt-5">
                      <button
                        onClick={() => startEdit(item)}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-5 rounded-lg shadow transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteItem(item._id || item.id)}
                        className="bg-red-600 hover:bg-red-700 text-white py-2 px-5 rounded-lg shadow transition"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}