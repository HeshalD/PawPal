import React, { useEffect, useState } from 'react';
import axiosInstance from '../config/axiosConfig';

import { Calendar, Clock, User, Heart, Search, Download, RefreshCw, Plus, Edit, Trash2 } from 'lucide-react';
import {Link, useNavigate} from 'react-router-dom';
import Nav from '../Components/Nav/Nav';

export default function AppointmentDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const navigate = useNavigate();

  const loadAppointments = async () => {

    setLoading(true);
    setError(null);
    try {
      const isAdmin = localStorage.getItem('isAdmin') === 'true';
      const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
      const currentUserEmail = currentUser?.email || '';
      const url = isAdmin
        ? '/appointments'
        : `/api/appointments/by-email?email=${encodeURIComponent(currentUserEmail)}`;
      const response = await axiosInstance.get(url);
      const data = response.data;

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

  // Filter appointments based on search term and date filter
  useEffect(() => {
    let filtered = appointments;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.petName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.doctorName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(item => {
            const itemDate = new Date(item.date);
            itemDate.setHours(0, 0, 0, 0);
            return itemDate.getTime() === filterDate.getTime();
          });
          break;
        case 'upcoming':
          filtered = filtered.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= now;
          });
          break;
        case 'past':
          filtered = filtered.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate < now;
          });
          break;
        case 'week':
          filterDate.setDate(now.getDate() + 7);
          filtered = filtered.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= now && itemDate <= filterDate;
          });
          break;
        default:
          break;
      }
    }
    
    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, dateFilter]);

  // Cancel appointment
  const cancelAppointment = async (id) => {

    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }
    
    try {
      const isAdmin = localStorage.getItem('isAdmin') === 'true';
      const endpoint = isAdmin ? `/appointments/${id}` : `/api/appointments/${id}`;
      await axiosInstance.delete(endpoint);
      await loadAppointments();
      alert('Appointment cancelled successfully!');
    } catch (e) {
      console.error('Cancel error:', e);
      setError(`Cancel failed: ${e.message}`);
    }
  };

  const editAppointment = (id) => {
    navigate(`/appointments/${id}/edit`);
  };

  // Download report
  const downloadReport = () => {
    const csvContent = generateCSVReport();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appointments-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateCSVReport = () => {
    let csv = 'Appointment Report\n';
    csv += `Generated: ${new Date().toLocaleString()}\n`;
    csv += `Total Appointments: ${filteredAppointments.length}\n\n`;
    
    csv += 'Pet Name,Owner Name,Doctor Name,Date,Time Slot,Status\n';
    filteredAppointments.forEach(apt => {
      const status = new Date(apt.date) >= new Date() ? 'Upcoming' : 'Past';
      csv += `"${apt.petName}","${apt.ownerName}","${apt.doctorName}","${new Date(apt.date).toLocaleDateString()}","${apt.timeSlot}","${status}"\n`;
    });
    
    return csv;
  };

  // Calculate statistics
  const stats = {
    total: appointments.length,
    upcoming: appointments.filter(a => new Date(a.date) >= new Date()).length,
    past: appointments.filter(a => new Date(a.date) < new Date()).length,
    today: appointments.filter(a => {
      const aptDate = new Date(a.date);
      const today = new Date();
      aptDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      return aptDate.getTime() === today.getTime();
    }).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
      <Nav collapsed={collapsed} setCollapsed={setCollapsed} />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'} p-6`}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">Loading Appointments...</p>
        </div>
      </div>
      </div>  
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav collapsed={collapsed} setCollapsed={setCollapsed} />
      
      {/* Main Content */}
    <div className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'} p-6`}>
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Appointments
              </h1>
              <p className="text-gray-600 mt-1">View and manage your pet appointments</p>
            </div>
            <div className="flex space-x-4">
                <Link to="/appointmentform">
              <button
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span>Book Appointment</span>
              </button>
              </Link>
              <button
                onClick={loadAppointments}
                className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-purple-500 text-purple-600 rounded-lg hover:bg-purple-50 transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={downloadReport}
                className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Calendar className="w-8 h-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Upcoming</p>
                <p className="text-3xl font-bold">{stats.upcoming}</p>
              </div>
              <Clock className="w-8 h-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Today</p>
                <p className="text-3xl font-bold">{stats.today}</p>
              </div>
              <Heart className="w-8 h-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-100 text-sm font-medium">Past</p>
                <p className="text-3xl font-bold">{stats.past}</p>
              </div>
              <User className="w-8 h-8 opacity-80" />
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
                  placeholder="Search by pet name, owner, or doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Appointments</option>
              <option value="today">Today</option>
              <option value="upcoming">Upcoming</option>
              <option value="week">This Week</option>
              <option value="past">Past</option>
            </select>
          </div>
        </div>

        {/* Appointments Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Appointments ({filteredAppointments.length})
            </h3>
          </div>
          
          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No appointments found</p>
              <p className="text-sm text-gray-400 mt-2">Book your first appointment to get started!</p>
            </div>
          ) : (
            filteredAppointments.map((appointment) => {
              const appointmentDate = new Date(appointment.date);
              const isUpcoming = appointmentDate >= new Date();
              
              return (
                <div 
                  key={appointment._id} 
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      {/* Left Section - Pet & Owner Info */}
                      <div className="flex items-center space-x-6 flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="bg-pink-100 p-3 rounded-full">
                            <Heart className="w-6 h-6 text-pink-500" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{appointment.petName}</h4>
                            <p className="text-sm text-gray-500">{appointment.ownerName}</p>
                          </div>
                        </div>
                      </div>

                      {/* Date & Time Section */}
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <Calendar className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {appointmentDate.toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                          <p className="text-xs text-gray-500">{appointment.timeSlot}</p>
                        </div>
                      </div>

                      {/* Status & Action Section */}
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full ${
                          isUpcoming 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {isUpcoming ? 'Upcoming' : 'Past'}
                        </span>
                        <button
                          onClick={() => editAppointment(appointment._id)}
                          className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all duration-200"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => cancelAppointment(appointment._id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
    </div>
   </div>
  );
}