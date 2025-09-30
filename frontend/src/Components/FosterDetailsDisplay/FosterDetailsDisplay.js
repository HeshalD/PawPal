import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-center">Loading foster requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <Heart className="text-green-600" size={32} />
                Foster Care Management
              </h1>
              <p className="text-gray-600">Manage and view pet foster care applications</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handlePrint}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
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
                className="w-full pl-12 pr-4 py-4 bg-white rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 shadow-sm"
              />
            </div>
          </div>
          {/* Status Filter */}
          <div className="lg:col-span-1">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-4 px-4 bg-white rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 shadow-sm"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          {/* Stats Card */}
          <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold">{filteredFosters.length}</div>
            <div className="text-green-100">Foster Requests</div>
          </div>
        </div>

        {/* Foster Cards Grid */}
        <div ref={ComponentsRef}>
          {filteredFosters.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
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
                  className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          <PawPrint size={20} />
                          {item.fullName}
                        </h3>
                        <p className="text-green-100">Foster Application</p>
                      </div>
                      <div className="flex gap-2">
                        {/* Status badge */}
                        <div
                          className="px-3 py-1 rounded-full text-xs font-semibold mr-2"
                          style={{
                            backgroundColor: (item.status || 'pending') === 'approved' ? '#22c55e' : (item.status || 'pending') === 'completed' ? '#6366f1' : '#f59e0b',
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
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                          />
                          <textarea
                            name="address"
                            value={editData.address || ""}
                            onChange={onEditChange}
                            placeholder="Address"
                            rows={2}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 resize-none"
                          />
                          <input
                            name="contact"
                            value={editData.contact || ""}
                            onChange={onEditChange}
                            placeholder="Contact Number"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                          />
                          <input
                            name="email"
                            type="email"
                            value={editData.email || ""}
                            onChange={onEditChange}
                            placeholder="Email"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                          />
                          <input
                            name="animalName"
                            value={editData.animalName || ""}
                            onChange={onEditChange}
                            placeholder="Animal Name/ID"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                          />
                          <input
                            name="animalType"
                            value={editData.animalType || ""}
                            onChange={onEditChange}
                            placeholder="Animal Type"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Foster From</label>
                              <input
                                type="date"
                                name="fosterFrom"
                                value={editData.fosterFrom || ""}
                                onChange={onEditChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Foster To</label>
                              <input
                                type="date"
                                name="fosterTo"
                                value={editData.fosterTo || ""}
                                onChange={onEditChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                              />
                            </div>
                          </div>
                          <select
                            name="experience"
                            value={editData.experience || "No"}
                            onChange={onEditChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                          >
                            <option value="No">No Experience</option>
                            <option value="Yes">Has Experience</option>
                          </select>
                          <input
                            name="homeEnvironment"
                            value={editData.homeEnvironment || ""}
                            onChange={onEditChange}
                            placeholder="Home Environment"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                          />
                          <textarea
                            name="notes"
                            value={editData.notes || ""}
                            onChange={onEditChange}
                            placeholder="Additional Notes"
                            rows={2}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 resize-none"
                          />
                        </div>
                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={() => saveEdit(item._id || item.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200"
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
                          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <MapPin className="text-green-600 mt-1 flex-shrink-0" size={18} />
                            <div className="min-w-0">
                              <div className="font-medium text-gray-800 break-words">{item.address}</div>
                              <div className="text-sm text-gray-600">Address</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <Phone className="text-green-600 flex-shrink-0" size={18} />
                              <div className="min-w-0">
                                <div className="font-medium text-gray-800 break-all">{item.contact}</div>
                                <div className="text-sm text-gray-600">Contact</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <Mail className="text-green-600 flex-shrink-0" size={18} />
                              <div className="min-w-0">
                                <div className="font-medium text-gray-800 break-all text-sm">{item.email}</div>
                                <div className="text-sm text-gray-600">Email</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Animal Information */}
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <PawPrint className="text-blue-600" size={18} />
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
                        <div className="bg-orange-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <Calendar className="text-orange-600" size={18} />
                            Foster Period
                          </h4>
                          <div className="flex items-center gap-3 text-sm">
                            <Clock className="text-orange-600" size={16} />
                            <span className="text-gray-600">
                              {item.fosterFrom} → {item.fosterTo}
                            </span>
                          </div>
                        </div>

                        {/* Experience and Environment */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-purple-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Award className="text-purple-600" size={16} />
                              <span className="font-medium text-gray-700 text-sm">Experience</span>
                            </div>
                            <div className={`text-sm font-medium ${item.experience === 'Yes' ? 'text-green-600' : 'text-gray-600'}`}>
                              {item.experience}
                            </div>
                          </div>
                          <div className="bg-teal-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Home className="text-teal-600" size={16} />
                              <span className="font-medium text-gray-700 text-sm">Home</span>
                            </div>
                            <div className="text-sm text-gray-600 break-words">{item.homeEnvironment}</div>
                          </div>
                        </div>

                        {/* Notes */}
                        {item.notes && (
                          <div className="bg-yellow-50 rounded-lg p-4">
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
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 flex-1"
                          >
                            <MessageCircle size={16} />
                            WhatsApp
                          </button>
                          {/* Status actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateStatus(item._id || item.id, 'pending')}
                              className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg text-sm"
                              title="Mark as Pending"
                            >
                              Pending
                            </button>
                            <button
                              onClick={() => updateStatus(item._id || item.id, 'approved')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm"
                              title="Approve"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateStatus(item._id || item.id, 'completed')}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm"
                              title="Mark as Completed"
                            >
                              Complete
                            </button>
                          </div>
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
  );
}