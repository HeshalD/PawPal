import React, { useEffect, useState } from "react";
import axios from "axios";
import Nav from "../Components/Nav/NavAdmin";
import { Link } from "react-router-dom";
import { Calendar, Clock, User, Heart, Search, Filter, Download, RefreshCw } from "lucide-react";

function AdminAllAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("All");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get("http://localhost:5000/appointments");
        const data = Array.isArray(res.data) ? res.data : (res.data.appointments || []);
        setAppointments(data);
        setFilteredAppointments(data);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  useEffect(() => {
    let filtered = [...appointments];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        (a.petName || "").toLowerCase().includes(q) ||
        (a.ownerName || "").toLowerCase().includes(q) ||
        (a.ownerEmail || "").toLowerCase().includes(q)
      );
    }

    if (dateFilter !== "All") {
      const now = new Date();
      const filterDate = new Date();
      if (dateFilter === "Today") {
        filterDate.setHours(0, 0, 0, 0);
        filtered = filtered.filter(item => {
          const d = new Date(item.date);
          d.setHours(0, 0, 0, 0);
          return d.getTime() === filterDate.getTime();
        });
      } else if (dateFilter === "Upcoming") {
        filtered = filtered.filter(item => new Date(item.date) >= now);
      } else if (dateFilter === "Past") {
        filtered = filtered.filter(item => new Date(item.date) < now);
      } else if (dateFilter === "Week") {
        filterDate.setDate(now.getDate() + 7);
        filtered = filtered.filter(item => {
          const d = new Date(item.date);
          return d >= now && d <= filterDate;
        });
      }
    }

    setFilteredAppointments(filtered);
  }, [searchTerm, dateFilter, appointments]);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/appointments");
      const data = Array.isArray(res.data) ? res.data : (res.data.appointments || []);
      setAppointments(data);
    } catch (err) {
      console.error("Error refreshing:", err);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: appointments.length,
    upcoming: appointments.filter(a => new Date(a.date) >= new Date()).length,
    past: appointments.filter(a => new Date(a.date) < new Date()).length,
    today: appointments.filter(a => {
      const d = new Date(a.date);
      const t = new Date();
      d.setHours(0,0,0,0);
      t.setHours(0,0,0,0);
      return d.getTime() === t.getTime();
    }).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'} p-6`}>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-4 text-gray-600">Loading appointments...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'} p-6`}>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Appointments</h1>
              <p className="text-gray-600 mt-1">View and manage every user's appointments</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by pet, owner, email, doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                >
                  <option value="All">All</option>
                  <option value="Today">Today</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Week">This Week</option>
                  <option value="Past">Past</option>
                </select>
              </div>
              <button
                onClick={refresh}
                className="flex items-center gap-2 px-4 py-2 text-purple-600 bg-white border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Appointments</h2>
              <span className="text-sm opacity-90">
                Showing {filteredAppointments.length} appointments
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-pink-100 border-b border-pink-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Pet</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Owner</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Email</th>
                  
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Time</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12">
                      <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-500 mb-2">No Appointments Found</h3>
                      <p className="text-gray-400">Try adjusting your search or filter criteria</p>
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => {
                    const d = new Date(apt.date);
                    const isUpcoming = d >= new Date();
                    return (
                      <tr key={apt._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-gray-900">{apt.petName}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-gray-900">{apt.ownerName}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-gray-700">{apt.ownerEmail || '-'}</div>
                        </td>
                        
                        <td className="py-4 px-6">
                          {d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-4 px-6">{apt.timeSlot}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isUpcoming ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {isUpcoming ? 'Upcoming' : 'Past'}
                          </span>
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
  );
}

export default AdminAllAppointments;


