import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axiosInstance from '../config/axiosConfig';
import { Calendar, Clock, User, Heart, UserCircle } from 'lucide-react';

function AppointmentForm() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState({
    petName: '',
    ownerName: '',
    ownerEmail: '',
    date: '',
    timeSlot: ''
  });

  // Validation helpers
  const isNonEmptyName = (value) => /^[A-Za-z ]{2,}$/.test(value.trim());
  const isValidDateNotPast = (value) => {
    if (!value) return false;
    const selected = new Date(value);
    const today = new Date();
    // Zero out time for date-only comparison
    selected.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return selected >= today;
  };
  const isValidEmail = (value) => {
    if (!value) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  };
  const isValidTimeWindow = (value) => {
    if (!value) return false;
    const [hoursStr, minutesStr] = value.split(':');
    const totalMinutes = Number(hoursStr) * 60 + Number(minutesStr || 0);
    const minMinutes = 9 * 60;    // 09:00
    const maxMinutes = 18 * 60;   // 18:00
    return totalMinutes >= minMinutes && totalMinutes <= maxMinutes;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAppointment((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validations
    if (!isNonEmptyName(appointment.petName)) {
      alert('Please enter a valid Pet Name (letters and spaces, min 2 characters).');
      return;
    }
    if (!isNonEmptyName(appointment.ownerName)) {
      alert('Please enter a valid Owner Name (letters and spaces, min 2 characters).');
      return;
    }
    if (!isValidDateNotPast(appointment.date)) {
      alert('Appointment Date cannot be in the past.');
      return;
    }
    if (!isValidTimeWindow(appointment.timeSlot)) {
      alert('Time Slot must be between 09:00 and 18:00.');
      return;
    }
    if (!isValidEmail(appointment.ownerEmail)) {
      alert('Please enter a valid Email.');
      return;
    }

    setLoading(true);

    try {
      // Use axiosInstance (injects JWT) to protected endpoint
      const response = await axiosInstance.post('/api/appointments', {
        petName: appointment.petName,
        ownerName: appointment.ownerName,
        ownerEmail: appointment.ownerEmail.trim(),
        date: appointment.date,
        timeSlot: appointment.timeSlot
      });

      if (response.data) {
        const emailOk = response.data?.email?.ok;
        const emailSimulated = response.data?.email?.simulated;
        const emailMsg = emailOk
          ? (emailSimulated ? 'Email simulated (SMTP not configured).' : 'Confirmation email sent.')
          : 'Failed to send confirmation email.';
        alert(`Appointment booked successfully!\n${emailMsg}`);
        // Reset form
        setAppointment({
          petName: '',
          ownerName: '',
          ownerEmail: '',
          date: '',
          timeSlot: ''
        });
        // ✅ Navigate AFTER successful submission
        navigate('/appointmentview');
      }
    } catch (error) {
      console.error('Appointment booking error:', error);
      if (error.response?.status === 400) {
        alert('Please fill all required fields correctly.');
      } else if (error.response?.status === 409) {
        alert('This time slot is already booked. Please choose another time.');
      } else {
        alert('Failed to book appointment. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-[#6638E6] to-[#E6738F] flex items-center justify-center mb-6 shadow-lg">
            <Heart className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-[#6638E6] to-[#E6738F] bg-clip-text text-transparent mb-2">
            Book Appointment
          </h2>
          <p className="text-gray-600">Schedule your pet's consultation with our vets</p>
        </div>

        {/* Form Section */}
        <div className="bg-white shadow-2xl rounded-2xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pet Name Field */}
            <div>
              <label htmlFor="petName" className="block text-sm font-semibold text-gray-700 mb-3">
                <span className="bg-gradient-to-r from-[#6638E6] to-[#E6738F] bg-clip-text text-transparent">
                  Pet Name *
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Heart className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="petName"
                  value={appointment.petName}
                  onChange={handleInputChange}
                  placeholder="Enter your pet's name"
                  pattern="^[A-Za-z ]{2,}$"
                  title="Use letters and spaces only, at least 2 characters"
                  required
                  disabled={loading}
                  className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E69AAE] focus:border-[#E69AAE] transition duration-300 placeholder-gray-400 text-gray-900 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Owner Name Field */}
            <div>
              <label htmlFor="ownerName" className="block text-sm font-semibold text-gray-700 mb-3">
                <span className="bg-gradient-to-r from-[#6638E6] to-[#E6738F] bg-clip-text text-transparent">
                  Owner Name *
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="ownerName"
                  value={appointment.ownerName}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  pattern="^[A-Za-z ]{2,}$"
                  title="Use letters and spaces only, at least 2 characters"
                  required
                  disabled={loading}
                  className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E69AAE] focus:border-[#E69AAE] transition duration-300 placeholder-gray-400 text-gray-900 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Owner Email Field */}
            <div>
              <label htmlFor="ownerEmail" className="block text-sm font-semibold text-gray-700 mb-3">
                <span className="bg-gradient-to-r from-[#6638E6] to-[#E6738F] bg-clip-text text-transparent">
                  Email *
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserCircle className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="ownerEmail"
                  value={appointment.ownerEmail}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E69AAE] focus:border-[#E69AAE] transition duration-300 placeholder-gray-400 text-gray-900 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Date Field */}
            <div>
              <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-3">
                <span className="bg-gradient-to-r from-[#6638E6] to-[#E6738F] bg-clip-text text-transparent">
                  Appointment Date *
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="date"
                  value={appointment.date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  disabled={loading}
                  className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E69AAE] focus:border-[#E69AAE] transition duration-300 placeholder-gray-400 text-gray-900 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Time Slot Field */}
            <div>
              <label htmlFor="timeSlot" className="block text-sm font-semibold text-gray-700 mb-3">
                <span className="bg-gradient-to-r from-[#6638E6] to-[#E6738F] bg-clip-text text-transparent">
                  Time Slot *
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="time"
                  name="timeSlot"
                  value={appointment.timeSlot}
                  onChange={handleInputChange}
                  min="09:00"
                  max="18:00"
                  required
                  disabled={loading}
                  className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E69AAE] focus:border-[#E69AAE] transition duration-300 placeholder-gray-400 text-gray-900 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Submit Button - ✅ REMOVED Link wrapper */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white bg-gradient-to-r from-[#6638E6] to-[#E6738F] hover:from-[#5530CC] hover:to-[#E69AAE] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6638E6] transform hover:scale-[1.02] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Booking Appointment...
                </>
              ) : (
                'Book Appointment'
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need help?{' '}
              <a 
                href="/contact" 
                className="font-semibold bg-gradient-to-r from-[#6638E6] to-[#E6738F] bg-clip-text text-transparent hover:from-[#5530CC] hover:to-[#E69AAE] transition duration-200"
              >
                Contact support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppointmentForm;