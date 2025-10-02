import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import AdminNav from "../Nav/NavAdmin";

import { 
  Search, 
  Edit3, 
  Trash2, 
  MessageCircle, 
  Save, 
  X, 
  FileText, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Heart,
  PawPrint,
  Home,
  Clock,
  Award,
  StickyNote
} from "lucide-react";

const URL = "http://localhost:5000/fosters";

export default function FosterDetailsDisplay() {
  const [collapsed, setCollapsed] = useState(false);
  const [fosters, setFosters] = useState([]);
  const [filteredFosters, setFilteredFosters] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  // ✅ Print setup
  const ComponentsRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => ComponentsRef.current,
    documentTitle: "Foster_Details",
    onAfterPrint: () => alert("Foster details printed successfully!"),
  });

  const fetchFosters = () => {
    setIsLoading(true);
    axios
      .get(URL)
      .then((res) => {
        setFosters(res.data.fosters || []);
        setFilteredFosters(res.data.fosters || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchFosters();
  }, []);

  // Search + status filter functionality
  useEffect(() => {
    const base = fosters.filter((f) => {
      const q = search.toLowerCase();
      const matchesQuery =
        !q ||
        f.fullName?.toLowerCase().includes(q) ||
        f.animalName?.toLowerCase().includes(q) ||
        f.animalType?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || (f.status || "pending").toLowerCase() === statusFilter;
      return matchesQuery && matchesStatus;
    });
    setFilteredFosters(base);
  }, [search, fosters, statusFilter]);

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditData({ ...item });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const onEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`${URL}/${id}`, editData);
      setEditingId(null);
      setEditData({});
      fetchFosters();
    } catch (err) {
      console.error(err);
      alert("Failed to update. Please try again.");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${URL}/${id}/status`, { status });
      fetchFosters();
    } catch (err) {
      console.error(err);
      alert("Failed to update status. Please try again.");
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this foster request?")) return;
    try {
      await axios.delete(`${URL}/${id}`);
      setFosters((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete. Please try again.");
    }
  };

  const handleWhatsApp = (item) => {
    const phone = (item.contact || "").replace(/\D/g, "");
    const formattedPhone = phone.startsWith("0") ? "94" + phone.slice(1) : phone;
    const message = `Hello ${item.fullName}, regarding your foster request for ${item.animalName}. 🐾`;
    const whatsappURL = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'} p-6`}>
          <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderBottomColor: '#6638E6' }}></div>
              <p className="text-gray-600 text-center">Loading foster requests...</p>
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
        <div className="min-h-screen bg-white">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-200">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                    <Heart style={{ color: '#E6738F' }} size={32} />
                    Foster Care Management
                  </h1>
                  <p className="text-gray-600">Manage and view pet foster care applications</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handlePrint}
                    className="text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                    style={{ backgroundColor: '#6638E6' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5028C6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6638E6'}
                  >
                    <FileText size={20} />
                    Print All Records
                  </button>
                </div>
              </div>
            </div>

            {/* Search, Filter and Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
              {/* Search */}
              <div className="lg:col-span-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by name, animal name, or animal type..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white rounded-xl border border-gray-300 focus:ring-2 transition-all duration-200 shadow-sm"
                    style={{ borderColor: '#d1d5db' }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#E69AAE';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(230, 154, 174, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
              {/* Status Filter */}
              <div className="lg:col-span-1">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full py-4 px-4 bg-white rounded-xl border border-gray-300 focus:ring-2 transition-all duration-200 shadow-sm"
                  style={{ borderColor: '#d1d5db' }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#E69AAE';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(230, 154, 174, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              {/* Stats Card */}
              <div className="rounded-xl p-6 text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #6638E6 0%, #E6738F 100%)' }}>
                <div className="text-3xl font-bold">{filteredFosters.length}</div>
                <div className="text-white opacity-90">Foster Requests</div>
              </div>
            </div>

            {/* Foster Cards Grid */}
            <div ref={ComponentsRef}>
              {filteredFosters.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-200">
                  <PawPrint className="mx-auto text-gray-400 mb-4" size={64} />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Foster Requests Found</h3>
                  <p className="text-gray-500">
                    {search ? "Try adjusting your search terms" : "No foster applications available"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredFosters.map((item) => (
                    <div
                      key={item._id || item.id}
                      className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200"
                    >
                      {/* Card Header */}
                      <div className="p-6 text-white" style={{ background: 'linear-gradient(135deg, #6638E6 0%, #E6738F 100%)' }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-bold flex items-center gap-2">
                              <PawPrint size={20} />
                              {item.fullName}
                            </h3>
                            <p className="text-white opacity-90">Foster Application</p>
                          </div>
                          <div className="flex gap-2">
                            {/* Status badge */}
                            <div
                              className="px-3 py-1 rounded-full text-xs font-semibold mr-2"
                              style={{
                                backgroundColor: (item.status || 'pending') === 'approved' ? '#10b981' : (item.status || 'pending') === 'completed' ? '#14b8a6' : '#f59e0b',
                                color: '#fff'
                              }}
                              title={`Status: ${(item.status || 'pending').toUpperCase()}`}
                            >
                              {(item.status || 'pending').toUpperCase()}
                            </div>
                            {editingId !== (item._id || item.id) && (
                              <>
                                <button
                                  onClick={() => startEdit(item)}
                                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-lg transition-all duration-200"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  onClick={() => deleteItem(item._id || item.id)}
                                  className="bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm text-white p-2 rounded-lg transition-all duration-200"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-6">
                        {editingId === (item._id || item.id) ? (
                          /* Edit Form */
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                              <input
                                name="fullName"
                                value={editData.fullName || ""}
                                onChange={onEditChange}
                                placeholder="Full Name"
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all duration-200"
                                style={{ borderColor: '#d1d5db' }}
                                onFocus={(e) => {
                                  e.currentTarget.style.borderColor = '#E69AAE';
                                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(230, 154, 174, 0.1)';
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.borderColor = '#d1d5db';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              />
                              <textarea
                                name="address"
                                value={editData.address || ""}
                                onChange={onEditChange}
                                placeholder="Address"
                                rows={2}
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all duration-200 resize-none"
                                style={{ borderColor: '#d1d5db' }}
                                onFocus={(e) => {
                                  e.currentTarget.style.borderColor = '#E69AAE';
                                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(230, 154, 174, 0.1)';
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.borderColor = '#d1d5db';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              />
                              <input
                                name="contact"
                                value={editData.contact || ""}
                                onChange={onEditChange}
                                placeholder="Contact Number"
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all duration-200"
                                style={{ borderColor: '#d1d5db' }}
                                onFocus={(e) => {
                                  e.currentTarget.style.borderColor = '#E69AAE';
                                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(230, 154, 174, 0.1)';
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.borderColor = '#d1d5db';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              />
                              <input
                                name="email"
                                type="email"
                                value={editData.email || ""}
                                onChange={onEditChange}
                                placeholder="Email"
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all duration-200"
                                style={{ borderColor: '#d1d5db' }}
                                onFocus={(e) => {
                                  e.currentTarget.style.borderColor = '#E69AAE';
                                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(230, 154, 174, 0.1)';
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.borderColor = '#d1d5db';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              />
                              <input
                                name="animalName"
                                value={editData.animalName || ""}
                                onChange={onEditChange}
                                placeholder="Animal Name/ID"
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all duration-200"
                                style={{ borderColor: '#d1d5db' }}
                                onFocus={(e) => {
                                  e.currentTarget.style.borderColor = '#E69AAE';
                                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(230, 154, 174, 0.1)';
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.borderColor = '#d1d5db';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              />
                              <input
                                name="animalType"
                                value={editData.animalType || ""}
                                onChange={onEditChange}
                                placeholder="Animal Type"
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all duration-200"
                                style={{ borderColor: '#d1d5db' }}
                                onFocus={(e) => {
                                  e.currentTarget.style.borderColor = '#E69AAE';
                                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(230, 154, 174, 0.1)';
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.borderColor = '#d1d5db';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              />
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Foster From</label>
                                  <input
                                    type="date"
                                    name="fosterFrom"
                                    value={editData.fosterFrom || ""}
                                    onChange={onEditChange}
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all duration-200"
                                    style={{ borderColor: '#d1d5db' }}
                                    onFocus={(e) => {
                                      e.currentTarget.style.borderColor = '#E69AAE';
                                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(230, 154, 174, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                      e.currentTarget.style.borderColor = '#d1d5db';
                                      e.currentTarget.style.boxShadow = 'none';
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Foster To</label>
                                  <input
                                    type="date"
                                    name="fosterTo"
                                    value={editData.fosterTo || ""}
                                    onChange={onEditChange}
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all duration-200"
                                    style={{ borderColor: '#d1d5db' }}
                                    onFocus={(e) => {
                                      e.currentTarget.style.borderColor = '#E69AAE';
                                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(230, 154, 174, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                      e.currentTarget.style.borderColor = '#d1d5db';
                                      e.currentTarget.style.boxShadow = 'none';
                                    }}
                                  />
                                </div>
                              </div>
                              <select
                                name="experience"
                                value={editData.experience || "No"}
                                onChange={onEditChange}
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all duration-200"
                                style={{ borderColor: '#d1d5db' }}
                                onFocus={(e) => {
                                  e.currentTarget.style.borderColor = '#E69AAE';
                                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(230, 154, 174, 0.1)';
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.borderColor = '#d1d5db';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              >
                                <option value="No">No Experience</option>
                                <option value="Yes">Has Experience</option>
                              </select>
                              <input
                                name="homeEnvironment"
                                value={editData.homeEnvironment || ""}
                                onChange={onEditChange}
                                placeholder="Home Environment"
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all duration-200"
                                style={{ borderColor: '#d1d5db' }}
                                onFocus={(e) => {
                                  e.currentTarget.style.borderColor = '#E69AAE';
                                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(230, 154, 174, 0.1)';
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.borderColor = '#d1d5db';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              />
                              <textarea
                                name="notes"
                                value={editData.notes || ""}
                                onChange={onEditChange}
                                placeholder="Additional Notes"
                                rows={2}
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all duration-200 resize-none"
                                style={{ borderColor: '#d1d5db' }}
                                onFocus={(e) => {
                                  e.currentTarget.style.borderColor = '#E69AAE';
                                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(230, 154, 174, 0.1)';
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.borderColor = '#d1d5db';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              />
                            </div>
                            <div className="flex gap-3 pt-4">
                              <button
                                onClick={() => saveEdit(item._id || item.id)}
                                className="text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200"
                                style={{ backgroundColor: '#6638E6' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5028C6'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6638E6'}
                              >
                                <Save size={16} />
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200"
                              >
                                <X size={16} />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Display Mode */
                          <div className="space-y-4">
                            {/* Personal Information */}
                            <div className="space-y-3">
                              <div className="flex items-start gap-3 p-3 rounded-lg border" style={{ backgroundColor: '#FEF2F7', borderColor: '#E69AAE' }}>
                                <MapPin style={{ color: '#E6738F' }} className="mt-1 flex-shrink-0" size={18} />
                                <div className="min-w-0">
                                  <div className="font-medium text-gray-800 break-words">{item.address}</div>
                                  <div className="text-sm text-gray-600">Address</div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-3 p-3 rounded-lg border" style={{ backgroundColor: '#FEF2F7', borderColor: '#E69AAE' }}>
                                  <Phone style={{ color: '#E6738F' }} className="flex-shrink-0" size={18} />
                                  <div className="min-w-0">
                                    <div className="font-medium text-gray-800 break-all">{item.contact}</div>
                                    <div className="text-sm text-gray-600">Contact</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg border" style={{ backgroundColor: '#FEF2F7', borderColor: '#E69AAE' }}>
                                  <Mail style={{ color: '#E6738F' }} className="flex-shrink-0" size={18} />
                                  <div className="min-w-0">
                                    <div className="font-medium text-gray-800 break-all text-sm">{item.email}</div>
                                    <div className="text-sm text-gray-600">Email</div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Animal Information */}
                            <div className="rounded-lg p-4 border" style={{ backgroundColor: '#F5F3FF', borderColor: '#C4B5FD' }}>
                              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <PawPrint style={{ color: '#6638E6' }} size={18} />
                                Animal Information
                              </h4>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="font-medium text-gray-700">Name/ID:</span>
                                  <div className="text-gray-600">{item.animalName}</div>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Type:</span>
                                  <div className="text-gray-600">{item.animalType}</div>
                                </div>
                              </div>
                            </div>

                            {/* Foster Period */}
                            <div className="rounded-lg p-4 border" style={{ backgroundColor: '#FEF2F7', borderColor: '#E69AAE' }}>
                              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <Calendar style={{ color: '#E6738F' }} size={18} />
                                Foster Period
                              </h4>
                              <div className="flex items-center gap-3 text-sm">
                                <Clock style={{ color: '#E6738F' }} size={16} />
                                <span className="text-gray-600">
                                  {item.fosterFrom} → {item.fosterTo}
                                </span>
                              </div>
                            </div>

                            {/* Experience and Environment */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="rounded-lg p-3 border" style={{ backgroundColor: '#F5F3FF', borderColor: '#C4B5FD' }}>
                                <div className="flex items-center gap-2 mb-2">
                                  <Award style={{ color: '#6638E6' }} size={16} />
                                  <span className="font-medium text-gray-700 text-sm">Experience</span>
                                </div>
                                <div className={`text-sm font-medium ${item.experience === 'Yes' ? 'text-green-600' : 'text-gray-600'}`}>
                                  {item.experience}
                                </div>
                              </div>
                              <div className="rounded-lg p-3 border" style={{ backgroundColor: '#FEF2F7', borderColor: '#E69AAE' }}>
                                <div className="flex items-center gap-2 mb-2">
                                  <Home style={{ color: '#E6738F' }} size={16} />
                                  <span className="font-medium text-gray-700 text-sm">Home</span>
                                </div>
                                <div className="text-sm text-gray-600 break-words">{item.homeEnvironment}</div>
                              </div>
                            </div>

                            {/* Notes */}
                            {item.notes && (
                              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                <div className="flex items-start gap-2 mb-2">
                                  <StickyNote className="text-yellow-600 mt-0.5" size={16} />
                                  <span className="font-medium text-gray-700 text-sm">Additional Notes</span>
                                </div>
                                <p className="text-sm text-gray-600 break-words">{item.notes}</p>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                              <button
                                onClick={() => handleWhatsApp(item)}
                                className="text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 flex-1"
                                style={{ backgroundColor: '#25D366' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1DA851'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#25D366'}
                              >
                                <MessageCircle size={16} />
                                WhatsApp
                              </button>
                            </div>
                            
                            {/* Status actions */}
                            <div className="flex gap-2 pt-2">
                              <button
                                onClick={() => updateStatus(item._id || item.id, 'pending')}
                                className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg text-sm flex-1 transition-all duration-200"
                                title="Mark as Pending"
                              >
                                Pending
                              </button>
                              <button
                                onClick={() => updateStatus(item._id || item.id, 'approved')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm flex-1 transition-all duration-200"
                                title="Approve"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => updateStatus(item._id || item.id, 'completed')}
                                className="text-white px-3 py-2 rounded-lg text-sm flex-1 transition-all duration-200"
                                style={{ backgroundColor: '#6638E6' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5028C6'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6638E6'}
                                title="Mark as Completed"
                              >
                                Complete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}