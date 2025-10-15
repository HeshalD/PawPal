import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axiosInstance from '../config/axiosConfig';
import { Calendar, Clock, User, Heart, UserCircle } from 'lucide-react';

// Local date helpers to avoid UTC offset issues
const toYmdLocal = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
};
const todayLocalMidnight = () => {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
};
const tomorrowYmdLocal = () => {
  const t = todayLocalMidnight();
  t.setDate(t.getDate() + 1);
  return toYmdLocal(t);
};

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
  const [errors, setErrors] = useState({ petName: '', ownerName: '' });

  // Validation helpers
  const isNonEmptyName = (value) => /^[A-Za-z ]{2,}$/.test((value || '').trim());
  const isValidDateFuture = (value) => {
    if (!value) return false;
    const selected = new Date(value);
    const today = todayLocalMidnight();
    selected.setHours(0, 0, 0, 0);
    // Must be today or in the future (allow today)
    return selected.getTime() >= today.getTime();
  };
  const isValidEmail = (value) => {
    if (!value) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  };
  const isValidTimeWindow = (value) => {
    if (!value) return false;
    const [hoursStr, minutesStr] = value.split(':');
    const mins = Number(minutesStr || 0);
    // enforce :00 or :30
    if (!(mins === 0 || mins === 30)) return false;
    const totalMinutes = Number(hoursStr) * 60 + mins;
    const minMinutes = 9 * 60;        // 09:00 inclusive
    const maxStart = 17 * 60 + 30;    // last start 17:30 (< 18:00)
    return totalMinutes >= minMinutes && totalMinutes <= maxStart;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAppointment((prev) => ({ ...prev, [name]: value }));
    if (name === 'petName' || name === 'ownerName') {
      const ok = isNonEmptyName(value);
      setErrors((prev) => ({
        ...prev,
        [name]: ok ? '' : 'Use letters, spaces and at least two characters'
      }));
    }
  };

  // Compute dynamic min time if booking for today (rounded to next half-hour)
  const dynamicMinTime = (() => {
    const todayYmd = toYmdLocal(new Date());
    if (appointment.date !== todayYmd) return '09:00';
    const now = new Date();
    let h = now.getHours();
    let m = now.getMinutes();
    // round up to next half-hour strictly in future
    if (m < 30) {
      m = 30;
    } else {
      h += 1; m = 0;
    }
    if (h < 9) { h = 9; m = 0; }
    // cap at 17:30
    if (h > 17 || (h === 17 && m > 30)) { h = 17; m = 30; }
    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    return `${hh}:${mm}`;
  })();

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
    if (!isValidDateFuture(appointment.date)) {
      alert('Appointment Date must be today or in the future.');
      return;
    }
    // If booking for today, timeSlot must be a future time and before 18:00
    {
      const todayYmd = toYmdLocal(new Date());
      if (appointment.date === todayYmd) {
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const [hStr, mStr] = (appointment.timeSlot || '').split(':');
        const selMinutes = Number(hStr) * 60 + Number(mStr || 0);
        if (!(selMinutes > nowMinutes && selMinutes < 18 * 60)) {
          alert('Select a future time slot today before 6:00 PM.');
          return;
        }
        // enforce :00 or :30 today as well
        if (!(['00','30'].includes(String(mStr || '00')))) {
          alert('Please select a 30-minute slot (e.g., 03:00 PM or 03:30 PM).');
          return;
        }
      }
    }
    if (!isValidTimeWindow(appointment.timeSlot)) {
      alert('Time Slot must be between 09:00 and 17:30 in 30-minute steps.');
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
                {errors.petName && (
                  <p className="text-red-500 text-xs mt-1 ml-1">{errors.petName}</p>
                )}
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
                {errors.ownerName && (
                  <p className="text-red-500 text-xs mt-1 ml-1">{errors.ownerName}</p>
                )}
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
                  min={toYmdLocal(new Date())}
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
                  min={dynamicMinTime}
                  max="17:30"
                  step={1800}
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