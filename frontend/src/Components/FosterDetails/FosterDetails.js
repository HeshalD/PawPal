// FosterDetails.js
import React, { useState } from "react";
import axios from "axios";
const URL = "http://localhost:5001/fosters";

export default function FosterDetails() {
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    contact: "",
    email: "",
    animalName: "",
    animalType: "",
    fosterFrom: "",
    fosterTo: "",
    experience: "No",
    homeEnvironment: "",
    notes: ""
  });

  // input change handle
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(URL, formData);
      if (res && res.data && res.data.foster) {
        alert("Foster request submitted successfully!");
        setFormData({
          fullName: "",
          address: "",
          contact: "",
          email: "",
          animalName: "",
          animalType: "",
          fosterFrom: "",
          fosterTo: "",
          experience: "No",
          homeEnvironment: "",
          notes: ""
        });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit foster request. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 shadow-lg rounded-2xl mt-6">
      <h2 className="text-2xl font-bold mb-4 text-center">🐾 Foster Request Form</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* User Details */}
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="contact"
          placeholder="Contact Number"
          value={formData.contact}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        {/* Animal Details */}
        <input
          type="text"
          name="animalName"
          placeholder="Animal Name / ID"
          value={formData.animalName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <select
          name="animalType"
          value={formData.animalType}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select Animal Type</option>
          <option value="Dog">Dog</option>
          <option value="Cat">Cat</option>
          <option value="Other">Other</option>
        </select>

        {/* Foster Duration */}
        <label className="block font-medium">Foster Duration</label>
        <div className="flex gap-2">
          <input
            type="date"
            name="fosterFrom"
            value={formData.fosterFrom}
            onChange={handleChange}
            className="w-1/2 p-2 border rounded"
            required
          />
          <input
            type="date"
            name="fosterTo"
            value={formData.fosterTo}
            onChange={handleChange}
            className="w-1/2 p-2 border rounded"
            required
          />
        </div>

        {/* Additional Info */}
        <label className="block font-medium">Experience with Pets</label>
        <select
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>

        <input
          type="text"
          name="homeEnvironment"
          placeholder="Home Environment (House / Apartment)"
          value={formData.homeEnvironment}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <textarea
          name="notes"
          placeholder="Special Notes"
          value={formData.notes}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          rows="3"
        ></textarea>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
        >
          Submit Foster Request
        </button>
      </form>
    </div>
  );
}