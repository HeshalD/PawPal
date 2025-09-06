import React, { useState } from 'react';
import './adoptionDetails.css';

function AdoptionDetails() {
  const [formData, setFormData] = useState({
    selectedPets: [],
    fullName: '',
    email: '',
    phone: '',
    address: '',
    salary: '',
  });

  const [errors, setErrors] = useState({});

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
    if (!formData.phone) tempErrors.phone = 'Phone is required';
    if (!formData.address) tempErrors.address = 'Home Address is required';
    if (!formData.salary) tempErrors.salary = 'Salary is required';
    else if (parseInt(formData.salary) < 50000)
      tempErrors.salary = 'Salary must be at least 50,000';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      alert(
        `Adoption request submitted!\nAdopter: ${formData.fullName}\nPets: ${formData.selectedPets.join(
          ', '
        )}`
      );
      setFormData({
        selectedPets: [],
        fullName: '',
        email: '',
        phone: '',
        address: '',
        salary: '',
      });
      setErrors({});
    } else {
      alert('Please fix the errors before submitting.');
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

        <button type="submit" className="submit-btn">
          Submit Adoption Request
        </button>
      </form>
    </div>
  );
}

export default AdoptionDetails;
