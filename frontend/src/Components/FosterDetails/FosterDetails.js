import React, { useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Nav from '../Nav/Nav';

const URL = "http://localhost:5000/fosters";

export default function FosterDetails() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
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

  const [isLoading, setIsLoading] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [isEditingSubmission, setIsEditingSubmission] = useState(false);
  const ymd = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${da}`;
  };
  const todayYmd = ymd(new Date());

  // Letters-only for fullName, numbers-only for contact
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'contact') {
      if (value && !/^\d*$/.test(value)) return; // numbers-only
    }

    if (name === 'fullName') {
      if (value && !/^[a-zA-Z\s]*$/.test(value)) return; // letters-only
    }
    if (name === 'fosterFrom') {
      const v = value || '';
      const valid = v && v >= todayYmd ? v : '';
      const next = { ...formData, fosterFrom: valid };
      if (next.fosterTo && next.fosterTo <= valid) next.fosterTo = '';
      setFormData(next);
      return;
    }
    if (name === 'fosterTo') {
      const v = value || '';
      const minTo = formData.fosterFrom || todayYmd;
      const valid = v && v > minTo ? v : '';
      setFormData({ ...formData, fosterTo: valid });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const from = formData.fosterFrom;
    const to = formData.fosterTo;
    if (!from || from < todayYmd) {
      alert('From date must be today or a future date.');
      setIsLoading(false);
      return;
    }
    if (!to || to <= todayYmd) {
      alert('To date must be after today.');
      setIsLoading(false);
      return;
    }
    if (to <= from) {
      alert('To date must be after the From date.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post(URL, formData);
      if (res?.data?.foster) {
        const created = res.data.foster;
        setSubmission(created);
        alert(`Foster request submitted successfully! Status: ${created.status?.toUpperCase() || 'PENDING'}`);
        if (created && created._id) {
          navigate(`/foster/submitted/${created._id}`);
        }
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
    } finally {
      setIsLoading(false);
    }
  };

  const beginEditSubmission = () => {
    if (!submission) return;
    setFormData({
      fullName: submission.fullName || "",
      address: submission.address || "",
      contact: submission.contact || "",
      email: submission.email || "",
      animalName: submission.animalName || "",
      animalType: submission.animalType || "",
      fosterFrom: submission.fosterFrom || "",
      fosterTo: submission.fosterTo || "",
      experience: submission.experience || "No",
      homeEnvironment: submission.homeEnvironment || "",
      notes: submission.notes || "",
    });
    setIsEditingSubmission(true);
  };

  const saveSubmissionEdits = async () => {
    if (!submission?._id) return;
    setIsLoading(true);
    try {
      const res = await axios.put(`${URL}/${submission._id}`, formData);
      if (res?.data?.foster) {
        setSubmission(res.data.foster);
        alert("Your submission was updated successfully.");
        setIsEditingSubmission(false);
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
      alert("Failed to update your submission. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
        <Nav collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={`flex-1 transition-all duration-300 ${
          collapsed ? 'ml-16' : 'ml-64'
        } p-6`}>
    <>
      <style jsx>{`
        .custom-purple-hover:hover { background-color: #6638E6 !important; }
        .custom-pink-hover:hover { background-color: #E6738F !important; }
        .custom-highlight-hover:hover { background-color: #E69AAE !important; }
        .form-input {
          transition: all 0.3s ease;
          border: 2px solid #e5e7eb;
        }
        .form-input:focus {
          outline: none !important;
          border-color: #6638E6 !important;
          box-shadow: 0 0 0 3px rgba(102, 56, 230, 0.1) !important;
        }
        .section-divider {
          background: linear-gradient(90deg, #6638E6 0%, #E6738F 100%);
          height: 2px;
          border-radius: 1px;
        }
        .gradient-bg {
          background: linear-gradient(135deg, #6638E6 0%, #E6738F 100%);
        }
        .spinner {
          border: 2px solid #ffffff;
          border-top: 2px solid transparent;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 gradient-bg rounded-full mb-4">
              <span className="text-2xl text-white">🐾</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Foster Request Application</h1>
            <p className="text-gray-600 text-lg">Help us find loving temporary homes for animals in need</p>
            <div className="section-divider w-24 mx-auto mt-4"></div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="gradient-bg p-6">
              <h2 className="text-2xl font-bold text-white text-center">Application Form</h2>
            </div>
            <div className="p-8 space-y-8">
              {/* Personal Info */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="form-input w-full p-4 rounded-xl text-gray-800"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input w-full p-4 rounded-xl text-gray-800"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="tel"
                    name="contact"
                    placeholder="Your phone number"
                    value={formData.contact}
                    onChange={handleChange}
                    className="form-input w-full p-4 rounded-xl text-gray-800"
                    required
                  />
                  <input
                    type="text"
                    name="homeEnvironment"
                    placeholder="House / Apartment / Other"
                    value={formData.homeEnvironment}
                    onChange={handleChange}
                    className="form-input w-full p-4 rounded-xl text-gray-800"
                  />
                </div>
                <input
                  type="text"
                  name="address"
                  placeholder="Your complete address"
                  value={formData.address}
                  onChange={handleChange}
                  className="form-input w-full p-4 rounded-xl text-gray-800"
                  required
                />
              </div>

              {/* Animal Info */}
              <div className="section-divider"></div>
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Animal Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    name="animalName"
                    placeholder="Animal Name / ID"
                    value={formData.animalName}
                    onChange={handleChange}
                    className="form-input w-full p-4 rounded-xl text-gray-800"
                    required
                  />
                  <select
                    name="animalType"
                    value={formData.animalType}
                    onChange={handleChange}
                    className="form-input w-full p-4 rounded-xl text-gray-800"
                    required
                  >
                    <option value="">Select animal type</option>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Foster Duration */}
              <div className="section-divider"></div>
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Foster Duration</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="date" name="fosterFrom" value={formData.fosterFrom} onChange={handleChange} min={todayYmd} className="form-input w-full p-4 rounded-xl text-gray-800" required />
                  <input type="date" name="fosterTo" value={formData.fosterTo} onChange={handleChange} min={formData.fosterFrom || todayYmd} className="form-input w-full p-4 rounded-xl text-gray-800" required />
                </div>
              </div>

              {/* Additional Info */}
              <div className="section-divider"></div>
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">4</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Additional Information</h3>
                </div>
                <select name="experience" value={formData.experience} onChange={handleChange} className="form-input w-full p-4 rounded-xl text-gray-800">
                  <option value="No">No Previous Experience</option>
                  <option value="Yes">Yes, I have Experience</option>
                </select>
                <textarea
                  name="notes"
                  placeholder="Special notes..."
                  value={formData.notes}
                  onChange={handleChange}
                  className="form-input w-full p-4 rounded-xl text-gray-800 resize-none"
                  rows="4"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full gradient-bg custom-purple-hover text-white py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="spinner"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    "Submit Foster Request"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Submission Status */}
          {submission && (
            <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Submission Status</h3>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: submission.status === 'approved' ? '#dcfce7' : submission.status === 'completed' ? '#e0e7ff' : '#fef9c3',
                      color: submission.status === 'approved' ? '#166534' : submission.status === 'completed' ? '#3730a3' : '#854d0e'
                    }}
                  >
                    {submission.status?.toUpperCase() || 'PENDING'}
                  </div>
                  <p className="mt-2 text-gray-600 text-sm">Reference ID: {submission._id}</p>
                </div>
                <div>
                  {submission.status === 'pending' && !isEditingSubmission && (
                    <button onClick={beginEditSubmission} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Edit Submission</button>
                  )}
                  {isEditingSubmission && (
                    <div className="flex gap-2">
                      <button onClick={saveSubmissionEdits} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60">Save Changes</button>
                      <button onClick={() => setIsEditingSubmission(false)} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Cancel</button>
                    </div>
                  )}
                  {submission.status !== 'pending' && <p className="text-sm text-gray-500">Editing disabled after approval/completion.</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
        </div>
    </div>
  );
}