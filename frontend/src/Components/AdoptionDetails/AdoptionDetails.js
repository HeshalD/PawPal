import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Nav from '../Nav/Nav';


// Note: This is the URL for your actual implementation
const API_URL = 'http://localhost:5000/adoptions/add';

function AdoptionDetails() {
  const [collapsed, setCollapsed] = useState(false);
  const [formData, setFormData] = useState({
    selectedPets: [],
    fullName: '',
    email: '',
    age: '',
    phone: '',
    address: '',
    salary: '',
    salarySheet: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submittedAdoption, setSubmittedAdoption] = useState(null);

  // Sample pet list (later can be loaded from DB)
  const pets = [
    { id: 'P001', name: 'Bella', breed: 'Labrador' },
    { id: 'P002', name: 'Max', breed: 'German Shepherd' },
    { id: 'P003', name: 'Milo', breed: 'Persian Cat' },
    { id: 'P004', name: 'Lucy', breed: 'Beagle' },
  ];

  // Handle normal input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        setErrors({ ...errors, salarySheet: 'Please upload a PDF file only' });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, salarySheet: 'File size must be less than 5MB' });
        return;
      }
      setFormData({ ...formData, salarySheet: file });
      setErrors({ ...errors, salarySheet: '' });
    }
  };

  // Handle pet checkbox changes
  const handlePetSelection = (e) => {
    const { value, checked } = e.target;
    let updatedPets = [...formData.selectedPets];

    if (checked) {
      updatedPets.push(value);
    } else {
      updatedPets = updatedPets.filter((pet) => pet !== value);
    }

    setFormData({ ...formData, selectedPets: updatedPets });
  };

  // Validate form
  const validate = () => {
    let tempErrors = {};
    if (formData.selectedPets.length === 0)
      tempErrors.selectedPets = 'Please select at least one pet';
    if (!formData.fullName) tempErrors.fullName = 'Full Name is required';
    if (!formData.email) tempErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      tempErrors.email = 'Invalid email format';
    if (!formData.age) tempErrors.age = 'Age is required';
    else if (parseInt(formData.age) < 18)
      tempErrors.age = 'Age must be at least 18';
    if (!formData.phone) tempErrors.phone = 'Phone is required';
    if (!formData.address) tempErrors.address = 'Home Address is required';
    if (!formData.salary) tempErrors.salary = 'Salary is required';
    else if (parseInt(formData.salary) < 50000)
      tempErrors.salary = 'Salary must be at least 50,000';
    if (!formData.salarySheet) tempErrors.salarySheet = 'Salary sheet PDF is required';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      setSubmitMessage('Please fix the errors before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('age', parseInt(formData.age) || 0);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('salary', parseInt(formData.salary) || 0);
      formDataToSend.append('selectedPets', JSON.stringify(formData.selectedPets));
      formDataToSend.append('salarySheet', formData.salarySheet);

      const response = await axios.post('http://localhost:5000/adoptions/add', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Success: show confirmation and status
      const created = response?.data?.adoption;
      setSubmittedAdoption(created || null);
      setSubmitMessage('✅ Adoption request submitted successfully!');
      // Reset form
      setFormData({
        selectedPets: [],
        fullName: '',
        email: '',
        age: '',
        phone: '',
        address: '',
        salary: '',
        salarySheet: null,
      });
      setErrors({});
      setIsSubmitting(false);

    } catch (error) {
      console.error('Error submitting adoption request:', error);
      
      if (error.response) {
        setSubmitMessage(`❌ Error: ${error.response.data.message || 'Failed to submit adoption request'}`);
      } else if (error.request) {
        setSubmitMessage('❌ Error: Unable to connect to server. Please check if backend is running.');
      } else {
        setSubmitMessage('❌ Error: Something went wrong. Please try again.');
      }
      setIsSubmitting(false);
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
        .custom-purple-hover:hover {
          background-color: #6638E6 !important;
        }
        .custom-pink-hover:hover {
          background-color: #E6738F  !important;
        }
        .custom-highlight-hover:hover {
          background-color: #E69AAE !important;
        }
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
        .pet-card {
          transition: all 0.3s ease;
          border: 2px solid #e5e7eb;
        }
        .pet-card:hover {
          border-color: #E6738F;
          background-color: #fef7f7;
        }
        .pet-card.selected {
          border-color: #6638E6;
          background-color: #f3f0ff;
        }
        .file-upload-area {
          border: 2px dashed #e5e7eb;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .file-upload-area:hover {
          border-color: #6638E6;
          background-color: #f3f0ff;
        }
        .file-upload-area.has-file {
          border-color: #10b981;
          background-color: #f0fdf4;
        }
        .error-text {
          color: #dc2626;
          font-size: 0.875rem;
        }
        .success-message {
          background-color: #f0fdf4;
          border-color: #10b981;
          color: #047857;
        }
        .error-message {
          background-color: #fef2f2;
          border-color: #dc2626;
          color: #dc2626;
        }
      `}</style>
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 gradient-bg rounded-full mb-4">
              <span className="text-2xl text-white">🐕</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Pet Adoption Application</h1>
            <p className="text-gray-600 text-lg">Find your perfect companion and give them a loving home</p>
            <div className="section-divider w-24 mx-auto mt-4"></div>
          </div>

          {/* Main Form Container */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="gradient-bg p-6">
              <h2 className="text-2xl font-bold text-white text-center">Adoption Application Form</h2>
            </div>
            
            <div className="p-8">
              <div className="space-y-10">
                
                {/* Pet Selection Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">1</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Select Pets to Adopt</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {pets.map((pet) => {
                      const petValue = `${pet.name} (ID: ${pet.id}, Breed: ${pet.breed})`;
                      const isSelected = formData.selectedPets.includes(petValue);
                      
                      return (
                        <div
                          key={pet.id}
                          className={`pet-card p-4 rounded-xl cursor-pointer ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            const event = {
                              target: {
                                value: petValue,
                                checked: !isSelected
                              }
                            };
                            handlePetSelection(event);
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              value={petValue}
                              checked={isSelected}
                              onChange={handlePetSelection}
                              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800">{pet.name}</div>
                              <div className="text-sm text-gray-600">{pet.breed}</div>
                              <div className="text-xs text-gray-500">ID: {pet.id}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {errors.selectedPets && <div className="error-text">{errors.selectedPets}</div>}
                </div>

                <div className="section-divider"></div>

                {/* Personal Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">2</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="form-input w-full p-4 rounded-xl text-gray-800"
                      />
                      {errors.fullName && <div className="error-text mt-1">{errors.fullName}</div>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        className="form-input w-full p-4 rounded-xl text-gray-800"
                      />
                      {errors.email && <div className="error-text mt-1">{errors.email}</div>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        min="18"
                        placeholder="Must be 18 or older"
                        className="form-input w-full p-4 rounded-xl text-gray-800"
                      />
                      {errors.age && <div className="error-text mt-1">{errors.age}</div>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Your contact number"
                        className="form-input w-full p-4 rounded-xl text-gray-800"
                      />
                      {errors.phone && <div className="error-text mt-1">{errors.phone}</div>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Home Address *</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your complete address"
                      className="form-input w-full p-4 rounded-xl text-gray-800 resize-none"
                      rows="3"
                    />
                    {errors.address && <div className="error-text mt-1">{errors.address}</div>}
                  </div>
                </div>

                <div className="section-divider"></div>

                {/* Financial Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">3</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Financial Information</h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Salary *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">Rs </span>
                      <input
                        type="number"
                        name="salary"
                        value={formData.salary}
                        onChange={handleChange}
                        placeholder=" Minimum 50,000"
                        className="form-input w-full p-4 pl-8 rounded-xl text-gray-800"
                      />
                    </div>
                    {errors.salary && <div className="error-text mt-1">{errors.salary}</div>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Salary Sheet (PDF) *</label>
                    <div
                      className={`file-upload-area p-6 rounded-xl text-center ${formData.salarySheet ? 'has-file' : ''}`}
                      onClick={() => document.getElementById('salary-sheet').click()}
                    >
                      <input
                        type="file"
                        id="salary-sheet"
                        name="salarySheet"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      
                      {formData.salarySheet ? (
                        <div className="flex items-center justify-center space-x-3">
                          <span className="text-3xl">📄</span>
                          <div className="text-left">
                            <div className="font-medium text-gray-800">{formData.salarySheet.name}</div>
                            <div className="text-sm text-gray-600">
                              {(formData.salarySheet.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData({ ...formData, salarySheet: null });
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div>
                          <span className="text-4xl mb-2 block">📁</span>
                          <div className="text-gray-700 font-medium">Click to upload PDF file</div>
                          <div className="text-sm text-gray-500 mt-1">Maximum file size: 5MB</div>
                        </div>
                      )}
                    </div>
                    {errors.salarySheet && <div className="error-text mt-1">{errors.salarySheet}</div>}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Link to="/adoptionViewPage">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full gradient-bg custom-purple-hover text-white py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="spinner"></div>
                        <span>Submitting Application...</span>
                      </div>
                    ) : (
                      "Submit Adoption Request"
                    )}
                  </button>
                  </Link>
                </div>

                {/* Submit Message */}
                {submitMessage && (
                  <div className={`p-4 rounded-xl border-2 text-center font-medium ${
                    submitMessage.includes('✅') ? 'success-message' : 'error-message'
                  }`}>
                    {submitMessage}
                  </div>
                )}

                {/* Post-submit status panel */}
                {submittedAdoption && (
                  <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Application Submitted</h3>
                    <div className="text-green-700 mb-4">Your application has been received. You can track the status below.</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-white border border-green-100 rounded-lg p-3">
                        <div className="text-gray-500">Reference ID</div>
                        <div className="font-medium text-gray-800 break-all">{submittedAdoption._id}</div>
                      </div>
                      <div className="bg-white border border-green-100 rounded-lg p-3">
                        <div className="text-gray-500">Current Status</div>
                        <div className="font-medium text-gray-800">{(submittedAdoption.status || 'pending').toUpperCase()}</div>
                      </div>
                      <div className="bg-white border border-green-100 rounded-lg p-3">
                        <div className="text-gray-500">Submitted At</div>
                        <div className="font-medium text-gray-800">{submittedAdoption.submittedAt ? new Date(submittedAdoption.submittedAt).toLocaleString() : 'Just now'}</div>
                      </div>
                      <div className="bg-white border border-green-100 rounded-lg p-3">
                        <div className="text-gray-500">Email</div>
                        <div className="font-medium text-gray-800">{submittedAdoption.email}</div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-gray-600 mb-2">Selected Pets</div>
                      <div className="flex flex-wrap gap-2">
                        {(submittedAdoption.selectedPets || []).map((p, i) => (
                          <span key={i} className="px-3 py-1 bg-white border border-green-200 rounded-full text-gray-800 text-sm">{p}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-gray-600">
            <p className="text-sm">We'll review your application carefully and contact you within 2-3 business days.</p>
          </div>
        </div>
      </div>
    </>
      </div>
    </div>  
  );
}

export default AdoptionDetails;