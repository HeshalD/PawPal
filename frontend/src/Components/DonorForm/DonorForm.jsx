import React, { useState } from 'react';
import './DonorForm.css';

const DonorForm = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    age: '',
    phone: '',
    NIC: '',
    Email: '',
    Address: '',
    ContributionType: '',
    Amount: '',
    Currency: 'LKR',
    PaymentMethod: '',
    donationFrequency: 'one-time'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [donationId, setDonationId] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSlipForm, setShowSlipForm] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Full name validation
    if (!formData.fullname.trim()) {
      newErrors.fullname = 'Full name is required';
    } else if (formData.fullname.trim().length < 2) {
      newErrors.fullname = 'Full name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.fullname.trim())) {
      newErrors.fullname = 'Full name can only contain letters and spaces';
    }

    // Age validation
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(formData.age) || formData.age < 1 || formData.age > 120) {
      newErrors.age = 'Age must be between 1 and 120';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+94|0)[0-9]{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Sri Lankan phone number (e.g., +94771234567 or 0771234567)';
    }

    // NIC validation
    if (!formData.NIC.trim()) {
      newErrors.NIC = 'NIC number is required';
    } else if (!/^[0-9]{9}[VvXx]$/.test(formData.NIC.trim())) {
      newErrors.NIC = 'Please enter a valid NIC number (e.g., 123456789V)';
    }

    // Email validation
    if (!formData.Email.trim()) {
      newErrors.Email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email.trim())) {
      newErrors.Email = 'Please enter a valid email address';
    }

    // Address validation
    if (!formData.Address.trim()) {
      newErrors.Address = 'Address is required';
    } else if (formData.Address.trim().length < 10) {
      newErrors.Address = 'Address must be at least 10 characters long';
    }

    // Contribution type validation
    if (!formData.ContributionType) {
      newErrors.ContributionType = 'Please select a contribution type';
    }

    // Amount validation
    if (!formData.Amount) {
      newErrors.Amount = 'Amount is required';
    } else if (isNaN(formData.Amount) || parseFloat(formData.Amount) <= 0) {
      newErrors.Amount = 'Amount must be a positive number';
    } else if (parseFloat(formData.Amount) < 100) {
      newErrors.Amount = 'Minimum donation amount is 100 LKR';
    }

    // Payment method validation
    if (!formData.PaymentMethod) {
      newErrors.PaymentMethod = 'Please select a payment method';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/donations/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        setDonationId(result.donation._id);
        setSubmitted(true);
      } else {
        const errorData = await response.json();
        alert(`Error submitting donation: ${errorData.message || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error submitting donation. Please check your internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSlipUpload = async (e) => {
    if (!donationId) return;

    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload only JPG, PNG, or PDF files.');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('slip', file);

    try {
      const response = await fetch(`http://localhost:5000/donations/${donationId}/upload-slip`, {
        method: 'POST',
        body: uploadData,
      });

      if (response.ok) {
        alert('Payment slip uploaded successfully! Your donation is now pending approval.');
        setShowSlipForm(false);
      } else {
        alert('Error uploading slip. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error uploading slip. Please try again.');
    }
  };

  const handleNext = () => {
    setShowSlipForm(true);
  };

  if (submitted && !showSlipForm) {
    return (
      <div className="donor-form-container">
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>Your form is successfully submitted!</h2>
          <p>Thank you for your generous donation to our pet care organization.</p>
          <p>To complete your donation, please make the payment and upload your payment slip.</p>
          <button onClick={handleNext} className="next-btn">
            Complete Payment & Upload Slip
          </button>
        </div>
      </div>
    );
  }

  if (submitted && showSlipForm) {
    return (
      <div className="donor-form-container">
        <div className="slip-upload-section">
          <h2>Upload Payment Slip</h2>
          <p>Please upload your payment slip to complete the donation process:</p>
          <div className="file-upload-area">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleSlipUpload}
              className="slip-upload"
              id="slip-upload"
            />
            <label htmlFor="slip-upload" className="file-upload-label">
              <span className="upload-icon">📁</span>
              <span>Choose File (JPG, PNG, PDF)</span>
              <small>Max file size: 5MB</small>
            </label>
          </div>
          <p className="note">Once you upload the slip, your donation will be marked as pending for approval.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="donor-form-container">
      <h2>Pet Care Donation Form</h2>
      <form onSubmit={handleSubmit} className="donor-form">
        <div className="form-group">
          <label htmlFor="fullname">Full Name *</label>
          <input
            type="text"
            id="fullname"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            className={errors.fullname ? 'error' : ''}
            required
          />
          {errors.fullname && <span className="error-message">{errors.fullname}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="age">Age *</label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className={errors.age ? 'error' : ''}
            required
            min="1"
            max="120"
          />
          {errors.age && <span className="error-message">{errors.age}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={errors.phone ? 'error' : ''}
            required
            placeholder="+94XXXXXXXXX"
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="NIC">NIC Number *</label>
          <input
            type="text"
            id="NIC"
            name="NIC"
            value={formData.NIC}
            onChange={handleChange}
            className={errors.NIC ? 'error' : ''}
            required
            placeholder="123456789V"
          />
          {errors.NIC && <span className="error-message">{errors.NIC}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="Email">Email Address *</label>
          <input
            type="email"
            id="Email"
            name="Email"
            value={formData.Email}
            onChange={handleChange}
            className={errors.Email ? 'error' : ''}
            required
          />
          {errors.Email && <span className="error-message">{errors.Email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="Address">Address *</label>
          <textarea
            id="Address"
            name="Address"
            value={formData.Address}
            onChange={handleChange}
            className={errors.Address ? 'error' : ''}
            required
            rows="3"
          />
          {errors.Address && <span className="error-message">{errors.Address}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="ContributionType">Contribution Type *</label>
          <select
            id="ContributionType"
            name="ContributionType"
            value={formData.ContributionType}
            onChange={handleChange}
            className={errors.ContributionType ? 'error' : ''}
            required
          >
            <option value="">Select contribution type</option>
            <option value="Medical Care">Medical Care</option>
            <option value="Food & Supplies">Food & Supplies</option>
            <option value="Shelter">Shelter</option>
            <option value="General Donation">General Donation</option>
            <option value="Emergency Fund">Emergency Fund</option>
          </select>
          {errors.ContributionType && <span className="error-message">{errors.ContributionType}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="donationFrequency">Donation Frequency *</label>
          <select
            id="donationFrequency"
            name="donationFrequency"
            value={formData.donationFrequency}
            onChange={handleChange}
            required
          >
            <option value="one-time">One-time</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="Amount">Amount *</label>
          <input
            type="number"
            id="Amount"
            name="Amount"
            value={formData.Amount}
            onChange={handleChange}
            className={errors.Amount ? 'error' : ''}
            required
            min="1"
            step="0.01"
          />
          {errors.Amount && <span className="error-message">{errors.Amount}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="Currency">Currency *</label>
          <select
            id="Currency"
            name="Currency"
            value={formData.Currency}
            onChange={handleChange}
            required
          >
            <option value="LKR">LKR (Sri Lankan Rupees)</option>
            <option value="USD">USD (US Dollars)</option>
            <option value="EUR">EUR (Euros)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="PaymentMethod">Payment Method *</label>
          <select
            id="PaymentMethod"
            name="PaymentMethod"
            value={formData.PaymentMethod}
            onChange={handleChange}
            className={errors.PaymentMethod ? 'error' : ''}
            required
          >
            <option value="">Select payment method</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Online Payment">Online Payment</option>
            <option value="Cash">Cash</option>
            <option value="Check">Check</option>
          </select>
          {errors.PaymentMethod && <span className="error-message">{errors.PaymentMethod}</span>}
        </div>

        <button type="submit" disabled={isSubmitting} className="submit-btn">
          {isSubmitting ? 'Submitting...' : 'Submit Donation'}
        </button>
      </form>
    </div>
  );
};

export default DonorForm;

