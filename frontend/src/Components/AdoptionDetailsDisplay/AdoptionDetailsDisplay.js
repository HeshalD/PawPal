import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import { Search, Edit3, Trash2, Download, Eye, Save, X, FileText, Users, Phone, Mail, MapPin, DollarSign, Calendar, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

const URL = "http://localhost:5000/adoptions";

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function AdoptionDetailsDisplay() {
  const [adoption, setAdoption] = useState([]);
  const [filteredAdoptions, setFilteredAdoptions] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // ✅ Print setup
  const ComponentsRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => ComponentsRef.current,
    documentTitle: "Adoption_Details",
    onAfterPrint: () => alert("Adoption details printed successfully!"),
  });

  useEffect(() => {
    fetchHandler().then((data) => {
      setAdoption(data.adoptions);
      setFilteredAdoptions(data.adoptions);
      setIsLoading(false);
    });
  }, []);

  // Status utility functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'approved': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      case 'completed': return <AlertCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  // Search and filter functionality
  useEffect(() => {
    let filtered = adoption;

    // Apply search filter
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(item =>
        item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.selectedPets.some(pet => 
          pet.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    setFilteredAdoptions(filtered);
  }, [searchTerm, adoption, statusFilter]);

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditData({
      fullName: item.fullName || "",
      email: item.email || "",
      age: item.age ?? "",
      phone: item.phone || "",
      address: item.address || "",
      salary: item.salary ?? "",
      selectedPets: Array.isArray(item.selectedPets)
        ? item.selectedPets.join(", ")
        : "",
    });
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
      const payload = {
        ...editData,
        age: editData.age === "" ? undefined : parseInt(editData.age, 10),
        salary: editData.salary === "" ? undefined : parseInt(editData.salary, 10),
        selectedPets: typeof editData.selectedPets === "string"
          ? editData.selectedPets.split(",").map((s) => s.trim()).filter(Boolean)
          : editData.selectedPets,
      };
      
      await axios.put(`${URL}/${id}`, payload);
      // Refresh locally
      setAdoption((prev) =>
        prev.map((it) => (it._id === id ? { ...it, ...payload } : it))
      );
      setEditingId(null);
      setEditData({});
    } catch (error) {
      console.error("Error updating record:", error);
      alert("Failed to update record. Please try again.");
    }
  };

  const handlePdfView = (pdfPath) => {
    const fullPdfUrl = `http://localhost:5000/${pdfPath}`;
    setSelectedPdf(fullPdfUrl);
  };

  const closePdfViewer = () => setSelectedPdf(null);

  const downloadPdf = (pdfPath, fileName) => {
    const fullPdfUrl = `http://localhost:5000/${pdfPath}`;
    const link = document.createElement("a");
    link.href = fullPdfUrl;
    link.download = fileName || "salary-sheet.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this adoption record?")) {
      try {
        await axios.delete(`${URL}/${id}`);
        setAdoption(adoption.filter((item) => item._id !== id));
      } catch (error) {
        console.error("Error deleting record:", error);
      }
    }
  };

  const handleUpdate = (id) => {
    const item = adoption.find((a) => a._id === id);
    if (item) startEdit(item);
  };

  // Update adoption status
  const updateStatus = async (id, newStatus, adminNotes = '') => {
    setUpdatingStatus(id);
    try {
      const response = await axios.put(`${URL}/status/${id}`, {
        status: newStatus,
        adminNotes: adminNotes
      });
      
      // Update local state
      setAdoption(prev => 
        prev.map(item => 
          item._id === id ? { ...item, status: newStatus, adminNotes: adminNotes, updatedAt: new Date() } : item
        )
      );
      
      alert(`Application status updated to ${newStatus.toUpperCase()} successfully!`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Quick status update handlers
  const handleApprove = (id) => {
    if (window.confirm('Are you sure you want to approve this adoption application?')) {
      updateStatus(id, 'approved', 'Application approved by admin');
    }
  };

  const handleReject = (id) => {
    const reason = prompt('Please enter the reason for rejection:');
    if (reason !== null) {
      updateStatus(id, 'rejected', reason || 'Application rejected by admin');
    }
  };

  const handleComplete = (id) => {
    if (window.confirm('Mark this adoption as completed? This means the pet has been successfully adopted.')) {
      updateStatus(id, 'completed', 'Adoption process completed successfully');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-center">Loading adoption records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <Users className="text-indigo-600" size={32} />
                Adoption Management Dashboard
              </h1>
              <p className="text-gray-600">Manage and view pet adoption applications</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handlePrint}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <FileText size={20} />
                Print All Records
              </button>
            </div>
          </div>
        </div>

        {/* Search, Filter and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 mb-8">
          {/* Search */}
          <div className="lg:col-span-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, or pet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-4 bg-white rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 shadow-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          {/* Stats Card */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold">{filteredAdoptions.length}</div>
            <div className="text-indigo-100">Applications</div>
          </div>
        </div>

        {/* Status Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-yellow-200">
            <div className="flex items-center gap-2 text-yellow-600 mb-2">
              <Clock size={20} />
              <span className="font-semibold">Pending</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {adoption.filter(item => item.status === 'pending').length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-green-200">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CheckCircle size={20} />
              <span className="font-semibold">Approved</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {adoption.filter(item => item.status === 'approved').length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-red-200">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <XCircle size={20} />
              <span className="font-semibold">Rejected</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {adoption.filter(item => item.status === 'rejected').length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-200">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <AlertCircle size={20} />
              <span className="font-semibold">Completed</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {adoption.filter(item => item.status === 'completed').length}
            </div>
          </div>
        </div>

        {/* Records Grid */}
        <div ref={ComponentsRef} className="space-y-6">
          {filteredAdoptions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <Users className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Records Found</h3>
              <p className="text-gray-500">
                {searchTerm ? "Try adjusting your search terms" : "No adoption applications available"}
              </p>
            </div>
          ) : (
            filteredAdoptions.map((item, index) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold">Application #{index + 1}</h3>
                        <p className="text-indigo-100">Submitted by {item.fullName}</p>
                        <p className="text-indigo-200 text-sm">
                          {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : 'Date not available'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Status Badge */}
                        <div className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center gap-2 ${getStatusColor(item.status || 'pending')}`}>
                          {getStatusIcon(item.status || 'pending')}
                          {(item.status || 'pending').toUpperCase()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {editingId !== item._id && (
                        <>
                          <button
                            onClick={() => handleUpdate(item._id)}
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 text-sm"
                          >
                            <Edit3 size={14} />
                            Edit
                          </button>
                          
                          {item.status !== 'approved' && (
                            <button
                              onClick={() => handleApprove(item._id)}
                              disabled={updatingStatus === item._id}
                              className="bg-green-500/20 hover:bg-green-500/30 backdrop-blur-sm text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 text-sm disabled:opacity-50"
                            >
                              <CheckCircle size={14} />
                              {updatingStatus === item._id ? 'Updating...' : 'Approve'}
                            </button>
                          )}
                          
                          {item.status !== 'rejected' && (
                            <button
                              onClick={() => handleReject(item._id)}
                              disabled={updatingStatus === item._id}
                              className="bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 text-sm disabled:opacity-50"
                            >
                              <XCircle size={14} />
                              Reject
                            </button>
                          )}
                          
                          {item.status === 'approved' && (
                            <button
                              onClick={() => handleComplete(item._id)}
                              disabled={updatingStatus === item._id}
                              className="bg-blue-500/20 hover:bg-blue-500/30 backdrop-blur-sm text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 text-sm disabled:opacity-50"
                            >
                              <AlertCircle size={14} />
                              Complete
                            </button>
                          )}
                        </>
                      )}
                      
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 text-sm"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {editingId === item._id ? (
                    /* Edit Form */
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Users size={16} className="inline mr-2" />
                            Full Name
                          </label>
                          <input
                            name="fullName"
                            value={editData.fullName}
                            onChange={onEditChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Mail size={16} className="inline mr-2" />
                            Email
                          </label>
                          <input
                            name="email"
                            value={editData.email}
                            onChange={onEditChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Calendar size={16} className="inline mr-2" />
                            Age
                          </label>
                          <input
                            type="number"
                            name="age"
                            value={editData.age}
                            onChange={onEditChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Phone size={16} className="inline mr-2" />
                            Phone
                          </label>
                          <input
                            name="phone"
                            value={editData.phone}
                            onChange={onEditChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <MapPin size={16} className="inline mr-2" />
                          Address
                        </label>
                        <textarea
                          name="address"
                          value={editData.address}
                          onChange={onEditChange}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <DollarSign size={16} className="inline mr-2" />
                            Monthly Salary
                          </label>
                          <input
                            type="number"
                            name="salary"
                            value={editData.salary}
                            onChange={onEditChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Selected Pets (comma-separated)
                          </label>
                          <input
                            name="selectedPets"
                            value={editData.selectedPets}
                            onChange={onEditChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => saveEdit(item._id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all duration-200"
                        >
                          <Save size={16} />
                          Save Changes
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all duration-200"
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display Mode */
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <Users className="text-indigo-600" size={20} />
                            <div>
                              <div className="font-semibold text-gray-800">{item.fullName}</div>
                              <div className="text-sm text-gray-600">Full Name</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <Mail className="text-indigo-600" size={20} />
                            <div>
                              <div className="font-semibold text-gray-800">{item.email}</div>
                              <div className="text-sm text-gray-600">Email Address</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <Calendar className="text-indigo-600" size={20} />
                            <div>
                              <div className="font-semibold text-gray-800">{item.age} years old</div>
                              <div className="text-sm text-gray-600">Age</div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <Phone className="text-indigo-600" size={20} />
                            <div>
                              <div className="font-semibold text-gray-800">{item.phone}</div>
                              <div className="text-sm text-gray-600">Phone Number</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                            <MapPin className="text-indigo-600 mt-1" size={20} />
                            <div>
                              <div className="font-semibold text-gray-800">{item.address}</div>
                              <div className="text-sm text-gray-600">Address</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                            <DollarSign className="text-green-600" size={20} />
                            <div>
                              <div className="font-semibold text-gray-800">
                                Rs {item.salary?.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-600">Monthly Salary</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Selected Pets */}
                      <div className="bg-blue-50 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-800 mb-3">Selected Pets for Adoption</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {item.selectedPets && item.selectedPets.length > 0 ? (
                            item.selectedPets.map((pet, petIndex) => (
                              <div key={petIndex} className="bg-white p-3 rounded-lg shadow-sm border border-blue-200">
                                <div className="font-medium text-gray-800">{pet}</div>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-full text-gray-500 text-center py-4">
                              No pets selected for adoption
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Salary Sheet Section */}
                      <div className="bg-yellow-50 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <FileText className="text-yellow-600" size={20} />
                          Salary Sheet Document
                        </h4>
                        {item.salarySheet ? (
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() => handlePdfView(item.salarySheet)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200"
                            >
                              <Eye size={16} />
                              View PDF
                            </button>
                            <button
                              onClick={() =>
                                downloadPdf(item.salarySheet, `salary-sheet-${item.fullName}.pdf`)
                              }
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200"
                            >
                              <Download size={16} />
                              Download
                            </button>
                          </div>
                        ) : (
                          <div className="text-amber-700 bg-amber-100 p-3 rounded-lg">
                            ⚠️ No salary sheet has been uploaded for this application
                          </div>
                        )}
                      </div>

                      {/* Admin Notes Section */}
                      {item.adminNotes && (
                        <div className="bg-gray-50 rounded-lg p-6">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <FileText className="text-gray-600" size={20} />
                            Admin Notes
                          </h4>
                          <div className="text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                            {item.adminNotes}
                          </div>
                          <div className="text-sm text-gray-500 mt-2">
                            Last updated: {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'Not available'}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {selectedPdf && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Salary Sheet Document</h3>
              <button
                onClick={closePdfViewer}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-all duration-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <iframe
                src={selectedPdf}
                className="w-full h-96 border-none rounded-lg"
                title="Salary Sheet PDF"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdoptionDetailsDisplay;