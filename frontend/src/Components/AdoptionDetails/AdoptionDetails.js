import React, { useState } from 'react';
import axios from 'axios';
import './adoptionDetails.css';

function AdoptionDetails() {
  const [formData, setFormData] = useState({
    selectedPets: [],
    fullName: '',
    email: '',
    age: '',
    phone: '',
    address: '',
    salary: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

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
      // Prepare data for API call
      const apiData = {
        fullName: formData.fullName,
        email: formData.email,
        age: parseInt(formData.age) || 0, // Convert to number
        phone: formData.phone,
        address: formData.address,
        salary: parseInt(formData.salary) || 0, // Convert to number
        selectedPets: formData.selectedPets
      };

      // Send data to backend
      const response = await axios.post('http://localhost:5001/adoptions/add', apiData);
      
      if (response.status === 201) {
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
        });
        setErrors({});
      }
    } catch (error) {
      console.error('Error submitting adoption request:', error);
      
      if (error.response) {
        // Server responded with error status
        setSubmitMessage(`❌ Error: ${error.response.data.message || 'Failed to submit adoption request'}`);
      } else if (error.request) {
        // Request was made but no response received
        setSubmitMessage('❌ Error: Unable to connect to server. Please check if backend is running.');
      } else {
        // Something else happened
        setSubmitMessage('❌ Error: Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="adoption-form-container">
      <h1>Pet Adoption Form</h1>
      <form onSubmit={handleSubmit}>
        {/* Pet Selection - at the top */}
        <div className="form-group">
          <label><strong>Select Pets to Adopt:</strong></label>
          {pets.map((pet) => (
            <div key={pet.id}>
              <input
                type="checkbox"
                value={`${pet.name} (ID: ${pet.id}, Breed: ${pet.breed})`}
                checked={formData.selectedPets.includes(
                  `${pet.name} (ID: ${pet.id}, Breed: ${pet.breed})`
                )}
                onChange={handlePetSelection}
              />
              {pet.name} - {pet.breed} (ID: {pet.id})
            </div>
          ))}
          <div className="error">{errors.selectedPets}</div>
        </div>

        {/* Full Name */}
        <div className="form-group">
          <label>Full Name:</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
          />
          <div className="error">{errors.fullName}</div>
        </div>

        {/* Email */}
        <div className="form-group">
          <label>Email:</label>
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          <div className="error">{errors.email}</div>
        </div>

        {/* Age */}
        <div className="form-group">
          <label>Age:</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            min="18"
          />
          <div className="error">{errors.age}</div>
        </div>

        {/* Phone */}
        <div className="form-group">
          <label>Phone Number:</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
          <div className="error">{errors.phone}</div>
        </div>

        {/* Address */}
        <div className="form-group">
          <label>Home Address:</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
          <div className="error">{errors.address}</div>
        </div>

        {/* Salary */}
        <div className="form-group">
          <label>Monthly Salary:</label>
          <input
            type="number"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
          />
          <div className="error">{errors.salary}</div>
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Adoption Request'}
        </button>
        
        {/* Submit Message */}
        {submitMessage && (
          <div className={`submit-message ${submitMessage.includes('✅') ? 'success' : 'error'}`}>
            {submitMessage}
          </div>
        )}
      </form>
    </div>
  );
}

export default AdoptionDetails;
