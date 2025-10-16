import React, { useEffect, useState } from 'react';
import { Calendar, Clock, User, Heart, Search, RefreshCw, CheckCircle, XCircle, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminNav from '../Components/Nav/NavAdmin';
import { Link } from 'react-router-dom';

export default function AdminAppointmentView() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [notice, setNotice] = useState(null); // { type: 'success'|'warning'|'error', text: string }
  // Doctor availability admin management state
  const [entries, setEntries] = useState([]);
  const [entryLoading, setEntryLoading] = useState(false);
  const [entryForm, setEntryForm] = useState({ doctorName: '', date: '', time_slot: '', status: 'available' });
  const [editingId, setEditingId] = useState(null);

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/appointments');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched appointments:', data);
      
      const appointmentsData = Array.isArray(data) ? data : (data.appointments || []);
      setAppointments(appointmentsData);
    } catch (e) {
      console.error('Load appointments error:', e);
      setError(`Failed to load appointments: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadAppointments(); 
  }, []);

  // Load doctor availability entries
  const loadEntries = async () => {
    try {
      setEntryLoading(true);
      const res = await fetch('http://localhost:5000/doctor-availability/entries');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn('Load availability entries failed:', e);
    } finally {
      setEntryLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const resetEntryForm = () => {
    setEditingId(null);
    setEntryForm({ doctorName: '', date: '', time_slot: '', status: 'available' });
  };

  const saveEntry = async (e) => {
    e.preventDefault();
    try {
      // Client-side validations
      const nameOk = /^[A-Za-z .]{2,}$/.test(String(entryForm.doctorName || '').trim());
      if (!nameOk) {
        alert('Invalid Doctor Name. Use letters and spaces (min 2 characters).');
        return;
      }
      const todayYmd = new Date();
      const pad = (n) => String(n).padStart(2,'0');
      const minYmd = `${todayYmd.getFullYear()}-${pad(todayYmd.getMonth()+1)}-${pad(todayYmd.getDate())}`;
      if (!entryForm.date || entryForm.date < minYmd) {
        alert('Date must be today or a future date.');
        return;
      }
      const raw = String(entryForm.time_slot || '').trim();
      const isAll = raw.toUpperCase() === 'ALL';
      const flexible = /^(\d{1,2})(?::?(\d{2}))?(\s*(am|pm))?(\s*(to|-){1}\s*(\d{1,2})(?::?(\d{2}))?(\s*(am|pm))?)?$/i.test(raw);
      if (!(isAll || flexible)) {
        alert('Invalid Time Slot. Use ALL, HH:MM, HH:MM-HH:MM, or formats like 10am to 6pm.');
        return;
      }
      if (!['available','unavailable'].includes(entryForm.status)) {
        alert('Invalid status.');
        return;
      }
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `http://localhost:5000/doctor-availability/entries/${editingId}`
        : 'http://localhost:5000/doctor-availability/entries';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryForm)
      });
      if (res.status === 409) {
        alert('An entry already exists for this doctor/date/time slot.');
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await loadEntries();
      resetEntryForm();
    } catch (e2) {
      alert('Failed to save availability.');
    }
  };

  const editEntry = (it) => {
    setEditingId(it._id);
    const d = new Date(it.date);
    const ymd = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    setEntryForm({ doctorName: it.doctorName, date: ymd, time_slot: it.time_slot, status: it.status });
  };

  const deleteEntry = async (id) => {
    if (!window.confirm('Delete this availability entry?')) return;
    try {
      const res = await fetch(`http://localhost:5000/doctor-availability/entries/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await loadEntries();
    } catch (e) {
      alert('Failed to delete entry.');
    }
  };

  // Filter appointments
  useEffect(() => {
    let filtered = appointments;
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.petName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ownerName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    
    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, statusFilter]);

  // Accept appointment - ✅ IMPROVED with better error handling
  const acceptAppointment = async (id) => {
    try {
      console.log('Accepting appointment:', id);
      
      const response = await fetch(`http://localhost:5000/appointments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'accepted' })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Success:', result);

      // ✅ Refresh list after successful update
      await loadAppointments();
      
      // Clear any previous errors
      setError(null);

      // Show email notification result
      const emailOk = result?.email?.ok;
      if (emailOk) {
        setNotice({ type: 'success', text: 'Approved. Confirmation email sent to user.' });
      } else {
        setNotice({ type: 'warning', text: 'Approved. Email could not be sent (check SMTP settings).' });
      }
      setTimeout(() => setNotice(null), 4000);
    } catch (e) {
      console.error('Accept error:', e);
      setError(`Failed to accept: ${e.message}`);
      setNotice({ type: 'error', text: 'Failed to approve appointment.' });
      setTimeout(() => setNotice(null), 4000);
    }
  };

  // Reject appointment - UPDATE status to 'rejected' via PATCH
  const rejectAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to reject this appointment? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('Rejecting appointment:', id);
      
      const response = await fetch(`http://localhost:5000/appointments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'rejected' })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Success:', result);

      // Refresh list after successful rejection
      await loadAppointments();
      
      // Clear any previous errors
      setError(null);

      // Show email notification result
      const emailOk = result?.email?.ok;
      if (emailOk) {
        setNotice({ type: 'success', text: 'Declined. Notification email sent to user.' });
      } else {
        setNotice({ type: 'warning', text: 'Declined. Email could not be sent (check SMTP settings).' });
      }
      setTimeout(() => setNotice(null), 4000);
    } catch (e) {
      console.error('Reject error:', e);
      setError(`Failed to reject appointment: ${e.message}`);
      setNotice({ type: 'error', text: 'Failed to decline appointment.' });
      setTimeout(() => setNotice(null), 4000);
    }
  };

  // Calculate statistics
  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => !a.status || a.status === 'pending').length,
    accepted: appointments.filter(a => a.status === 'accepted').length,
    rejected: appointments.filter(a => a.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav collapsed={collapsed} setCollapsed={setCollapsed} />
        
        <div className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'} p-6`}>
          <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-indigo-600 font-medium">Loading Appointments...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'} p-6`}>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
          {/* Header */}
          <div className="bg-white shadow-lg border-b border-indigo-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Appointment Management
                  </h1>
                  <p className="text-gray-600 mt-1">Review and manage all pet appointments</p>
                </div>
                <div className="flex space-x-3">
                  <Link to="/vetpetview">
                  <button
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <Heart className="w-4 h-4" />
                    <span>Update Health Records</span>
                  </button>
                  </Link>
                  <button
                    onClick={loadAppointments}
                    className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all duration-200"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {notice && (
              <div className={`mb-6 rounded-lg p-4 border ${
                notice.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                notice.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="text-sm">{notice.text}</div>
                  <button onClick={() => setNotice(null)} className="text-xs opacity-70 hover:opacity-100">Close</button>
                </div>
              </div>
            )}
            {/* Doctor Availability Management (Admin) */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Doctor Availability</h3>
              </div>

              <form onSubmit={saveEntry} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Doctor Name</label>
                  <input
                    type="text"
                    value={entryForm.doctorName}
                    onChange={(e)=>setEntryForm(f=>({...f, doctorName: e.target.value }))}
                    placeholder="e.g., Dr. Sunethra"
                    required
                    pattern="^[A-Za-z .]{2,}$"
                    title="Use letters, spaces, and periods (e.g., Dr. Sunethra), at least 2 characters"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={entryForm.date}
                    onChange={(e)=>setEntryForm(f=>({...f, date: e.target.value }))}
                    min={(new Date()).toISOString().slice(0,10)}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={entryForm.time_slot}
                    onChange={(e)=>setEntryForm(f=>({...f, time_slot: e.target.value }))}
                    placeholder="HH:MM, HH:MM-HH:MM or ALL"
                    title="Use ALL, HH:MM, HH:MM-HH:MM, or formats like 10am to 6pm"
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={entryForm.status}
                    onChange={(e)=>setEntryForm(f=>({...f, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  >
                    <option value="available">available</option>
                    <option value="unavailable">unavailable</option>
                  </select>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="px-4 py-2 text-white rounded-lg bg-gradient-to-r from-[#6638E6] to-[#E6738F] hover:from-[#5530CC] hover:to-[#E69AAE]"
                    //className="px-4 py-2 text-white rounded-lg bg-gradient-to-r from-[#6638E6] to-[#6638E6] hover:from-[#6638E6] hover:to-[#6638E6]"
                  >
                    {editingId ? 'Update' : 'Add'}
                  </button>
                  {editingId && (
                    <button type="button" onClick={resetEntryForm} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg">Cancel</button>
                  )}
                </div>
              </form>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Slot</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {entryLoading ? (
                      <tr><td colSpan="5" className="px-6 py-4 text-sm text-gray-500">Loading...</td></tr>
                    ) : entries.length === 0 ? (
                      <tr><td colSpan="5" className="px-6 py-4 text-sm text-gray-500">No entries</td></tr>
                    ) : (
                      entries.map((it) => {
                        const d = new Date(it.date);
                        const ymd = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                        return (
                          <tr key={it._id}>
                            <td className="px-4 py-2 text-sm text-gray-900">{it.doctorName}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{ymd}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{it.time_slot}</td>
                            <td className="px-4 py-2">
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${it.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {it.status}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <div className="flex space-x-2">
                                <button onClick={() => editEntry(it)} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg">Edit</button>
                                <button onClick={() => deleteEntry(it._id)} className="px-3 py-1 bg-red-50 text-red-700 rounded-lg">Delete</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="text-red-400">⚠️</div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm font-medium">Total</p>
                    <p className="text-3xl font-bold">{stats.total}</p>
                  </div>
                  <Calendar className="w-8 h-8 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">Pending</p>
                    <p className="text-3xl font-bold">{stats.pending}</p>
                  </div>
                  <Clock className="w-8 h-8 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Accepted</p>
                    <p className="text-3xl font-bold">{stats.accepted}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">Rejected</p>
                    <p className="text-3xl font-bold">{stats.rejected}</p>
                  </div>
                  <XCircle className="w-8 h-8 opacity-80" />
                </div>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by pet name or owner..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Appointments Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                <h3 className="text-lg font-semibold text-gray-900">
                  Appointments ({filteredAppointments.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pet Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No appointments found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map((appointment) => {
                        const appointmentDate = new Date(appointment.date);
                        const status = appointment.status || 'pending';
                        
                        return (
                          <tr key={appointment._id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="bg-pink-100 p-2 rounded-full mr-3">
                                  <Heart className="w-5 h-5 text-pink-500" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {appointment.petName}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <User className="w-4 h-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-900">{appointment.ownerName}</span>
                              </div>
                            </td>
                            
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {appointmentDate.toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </div>
                              <div className="text-xs text-gray-500">{appointment.timeSlot}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                status === 'accepted' 
                                  ? 'bg-green-100 text-green-800' 
                                  : status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {status === 'pending' && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => acceptAppointment(appointment._id)}
                                    className="flex items-center space-x-1 text-green-600 hover:text-white bg-green-100 hover:bg-green-600 px-3 py-1.5 rounded-lg transition-all duration-200"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Accept</span>
                                  </button>
                                  <button
                                    onClick={() => rejectAppointment(appointment._id)}
                                    className="flex items-center space-x-1 text-red-600 hover:text-white bg-red-100 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-all duration-200"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    <span>Reject</span>
                                  </button>
                                </div>
                              )}
                              {status === 'accepted' && (
                                <span className="text-green-600 text-sm">Approved</span>
                              )}
                              {status === 'rejected' && (
                                <span className="text-red-600 text-sm">Declined</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}