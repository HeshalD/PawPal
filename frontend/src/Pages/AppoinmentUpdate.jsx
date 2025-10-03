import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, User, Heart, UserCircle } from 'lucide-react';

function AppointmentUpdate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [appointment, setAppointment] = useState({
    petName: '',
    ownerName: '',
    date: '',
    timeSlot: ''
  });

  // Validation helpers (mirroring AppoinmentForm.js)
  const isNonEmptyName = (value) => /^[A-Za-z ]{2,}$/.test((value || '').trim());
  const isValidDateNotPast = (value) => {
    if (!value) return false;
    const selected = new Date(value);
    const today = new Date();
    selected.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return selected >= today;
  };
  const isValidTimeWindow = (value) => {
    if (!value) return false;
    const [hoursStr, minutesStr] = value.split(':');
    const totalMinutes = Number(hoursStr) * 60 + Number(minutesStr || 0);
    const minMinutes = 9 * 60;    // 09:00
    const maxMinutes = 18 * 60;   // 18:00
    return totalMinutes >= minMinutes && totalMinutes <= maxMinutes;
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/appointments/${id}`);
        const a = res.data;
        setAppointment({
          petName: a.petName || '',
          ownerName: a.ownerName || '',
          date: a.date ? new Date(a.date).toISOString().split('T')[0] : '',
          timeSlot: a.timeSlot || ''
        });
      } catch (e) {
        console.error('Failed to load appointment', e);
        alert('Failed to load appointment');
        navigate('/appointmentview');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAppointment((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Client-side validations (same rules as create form)
    if (!isNonEmptyName(appointment.petName)) {
      alert("Please enter a valid Pet Name (letters and spaces, min 2 characters).");
      return;
    }
    if (!isNonEmptyName(appointment.ownerName)) {
      alert("Please enter a valid Owner Name (letters and spaces, min 2 characters).");
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
    setSaving(true);
    try {
      await axios.put(`http://localhost:5000/appointments/${id}`, {
        petName: appointment.petName,
        ownerName: appointment.ownerName,
        date: appointment.date,
        timeSlot: appointment.timeSlot
      });
      alert('Appointment updated successfully!');
      navigate('/appointmentview');
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update appointment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">Loading Appointment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-[#6638E6] to-[#E6738F] flex items-center justify-center mb-6 shadow-lg">
            <Heart className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-[#6638E6] to-[#E6738F] bg-clip-text text-transparent mb-2">
            Update Appointment
          </h2>
          <p className="text-gray-600">Modify your appointment details</p>
        </div>

        <div className="bg-white shadow-2xl rounded-2xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  disabled={saving}
                  className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E69AAE] focus:border-[#E69AAE] transition duration-300 placeholder-gray-400 text-gray-900 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

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
                  disabled={saving}
                  className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E69AAE] focus:border-[#E69AAE] transition duration-300 placeholder-gray-400 text-gray-900 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            

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
                  disabled={saving}
                  className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E69AAE] focus:border-[#E69AAE] transition duration-300 placeholder-gray-400 text-gray-900 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

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
                  disabled={saving}
                  className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E69AAE] focus:border-[#E69AAE] transition duration-300 placeholder-gray-400 text-gray-900 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white bg-gradient-to-r from-[#6638E6] to-[#E6738F] hover:from-[#5530CC] hover:to-[#E69AAE] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6638E6] transform hover:scale-[1.02] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AppointmentUpdate;
