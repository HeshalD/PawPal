import React, { useEffect, useState } from "react";
import Nav from "../Nav/NavAdmin";
import { Search, Edit3, Trash2, Download, Eye, Save, X, FileText, Users, Phone, Mail, MapPin, DollarSign, Calendar, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

function AdoptionDetailsDisplay() {
  const [collapsed, setCollapsed] = useState(false);
  const [adoption, setAdoption] = useState([
    {
      _id: "1",
      fullName: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "555-0123",
      age: 28,
      address: "123 Main St, Springfield",
      salary: 45000,
      selectedPets: ["Max", "Luna"],
      status: "pending",
      submittedAt: "2024-03-15",
      adminNotes: ""
    },
    {
      _id: "2",
      fullName: "Michael Chen",
      email: "m.chen@email.com",
      phone: "555-0456",
      age: 35,
      address: "456 Oak Ave, Riverside",
      salary: 62000,
      selectedPets: ["Buddy"],
      status: "approved",
      submittedAt: "2024-03-14",
      adminNotes: "Application approved by admin"
    },
    {
      _id: "3",
      fullName: "Emily Davis",
      email: "emily.d@email.com",
      phone: "555-0789",
      age: 42,
      address: "789 Pine Rd, Lakeside",
      salary: 55000,
      selectedPets: ["Charlie", "Bella"],
      status: "completed",
      submittedAt: "2024-03-10",
      adminNotes: "Adoption process completed successfully"
    }
  ]);
  const [filteredAdoptions, setFilteredAdoptions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    setFilteredAdoptions(adoption);
  }, []);

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

  useEffect(() => {
    let filtered = adoption;

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(item =>
        item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.selectedPets.some(pet => 
          pet.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

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

  const saveEdit = (id) => {
    const payload = {
      ...editData,
      age: editData.age === "" ? undefined : parseInt(editData.age, 10),
      salary: editData.salary === "" ? undefined : parseInt(editData.salary, 10),
      selectedPets: typeof editData.selectedPets === "string"
        ? editData.selectedPets.split(",").map((s) => s.trim()).filter(Boolean)
        : editData.selectedPets,
    };
    
    setAdoption((prev) =>
      prev.map((it) => (it._id === id ? { ...it, ...payload } : it))
    );
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this adoption record?")) {
      setAdoption(adoption.filter((item) => item._id !== id));
    }
  };

  const handleUpdate = (id) => {
    const item = adoption.find((a) => a._id === id);
    if (item) startEdit(item);
  };

  const updateStatus = (id, newStatus, adminNotes = '') => {
    setUpdatingStatus(id);
    setTimeout(() => {
      setAdoption(prev => 
        prev.map(item => 
          item._id === id ? { ...item, status: newStatus, adminNotes: adminNotes, updatedAt: new Date() } : item
        )
      );
      alert(`Application status updated to ${newStatus.toUpperCase()} successfully!`);
      setUpdatingStatus(null);
    }, 500);
  };

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

  const downloadPdfReport = () => {
    alert('PDF report generation would happen here in production!');
  };

  return (
    <div className="min-h-screen bg-white flex">
      <Nav collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'} p-6`}>
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-2" style={{borderColor: '#E69AAE'}}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <Users style={{color: '#6638E6'}} size={32} />
                Adoption Management Dashboard
              </h1>
              <p className="text-gray-600">Manage and view pet adoption applications</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={downloadPdfReport}
                className="text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                style={{backgroundColor: '#6638E6'}}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5527CC'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6638E6'}
              >
                <Download size={20} />
                Download PDF Report
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 mb-8">
          <div className="lg:col-span-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, or pet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-xl border-2 transition-all duration-200 shadow-sm"
                style={{borderColor: '#E69AAE'}}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#6638E6';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 56, 230, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E69AAE';
                  e.currentTarget.style.boxShadow = '';
                }}
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-4 bg-white rounded-xl border-2 transition-all duration-200 shadow-sm"
              style={{borderColor: '#E69AAE'}}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#6638E6';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 56, 230, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E69AAE';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div className="rounded-xl p-6 text-white shadow-lg" style={{background: 'linear-gradient(to right, #6638E6, #E6738F)'}}>
            <div className="text-3xl font-bold">{filteredAdoptions.length}</div>
            <div style={{color: '#FFE5EC'}}>Applications</div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-yellow-200">
            <div className="flex items-center gap-2 text-yellow-600 mb-2">
              <Clock size={20} />
              <span className="font-semibold">Pending</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {adoption.filter(item => item.status === 'pending').length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-green-200">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CheckCircle size={20} />
              <span className="font-semibold">Approved</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {adoption.filter(item => item.status === 'approved').length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-red-200">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <XCircle size={20} />
              <span className="font-semibold">Rejected</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {adoption.filter(item => item.status === 'rejected').length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-blue-200">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <AlertCircle size={20} />
              <span className="font-semibold">Completed</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {adoption.filter(item => item.status === 'completed').length}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {filteredAdoptions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center border-2" style={{borderColor: '#E69AAE'}}>
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
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border-2"
                style={{borderColor: '#E69AAE'}}
              >
                <div className="p-6 text-white" style={{background: 'linear-gradient(to right, #6638E6, #E6738F)'}}>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold">Application #{index + 1}</h3>
                        <p style={{color: '#FFE5EC'}}>Submitted by {item.fullName}</p>
                        <p className="text-sm" style={{color: '#FFD4E0'}}>
                          {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : 'Date not available'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center gap-2 ${getStatusColor(item.status || 'pending')}`}>
                          {getStatusIcon(item.status || 'pending')}
                          {(item.status || 'pending').toUpperCase()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {editingId !== item._id && (
                        <>
                          <button
                            onClick={() => handleUpdate(item._id)}
                            className="backdrop-blur-sm text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 text-sm"
                            style={{backgroundColor: 'rgba(255, 255, 255, 0.2)'}}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                          >
                            <Edit3 size={14} />
                            Edit
                          </button>
                          
                          {item.status !== 'approved' && (
                            <button
                              onClick={() => handleApprove(item._id)}
                              disabled={updatingStatus === item._id}
                              className="backdrop-blur-sm text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 text-sm disabled:opacity-50"
                              style={{backgroundColor: 'rgba(34, 197, 94, 0.2)'}}
                              onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.3)')}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.2)'}
                            >
                              <CheckCircle size={14} />
                              {updatingStatus === item._id ? 'Updating...' : 'Approve'}
                            </button>
                          )}
                          
                          {item.status !== 'rejected' && (
                            <button
                              onClick={() => handleReject(item._id)}
                              disabled={updatingStatus === item._id}
                              className="backdrop-blur-sm text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 text-sm disabled:opacity-50"
                              style={{backgroundColor: 'rgba(239, 68, 68, 0.2)'}}
                              onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.3)')}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'}
                            >
                              <XCircle size={14} />
                              Reject
                            </button>
                          )}
                          
                          {item.status === 'approved' && (
                            <button
                              onClick={() => handleComplete(item._id)}
                              disabled={updatingStatus === item._id}
                              className="backdrop-blur-sm text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 text-sm disabled:opacity-50"
                              style={{backgroundColor: 'rgba(59, 130, 246, 0.2)'}}
                              onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.3)')}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'}
                            >
                              <AlertCircle size={14} />
                              Complete
                            </button>
                          )}
                        </>
                      )}
                      
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="backdrop-blur-sm text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 text-sm"
                        style={{backgroundColor: 'rgba(239, 68, 68, 0.2)'}}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.3)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {editingId === item._id ? (
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
                            className="w-full px-4 py-3 border-2 rounded-lg transition-all duration-200"
                            style={{borderColor: '#E69AAE'}}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = '#6638E6';
                              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 56, 230, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = '#E69AAE';
                              e.currentTarget.style.boxShadow = '';
                            }}
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
                            className="w-full px-4 py-3 border-2 rounded-lg transition-all duration-200"
                            style={{borderColor: '#E69AAE'}}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = '#6638E6';
                              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 56, 230, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = '#E69AAE';
                              e.currentTarget.style.boxShadow = '';
                            }}
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
                            className="w-full px-4 py-3 border-2 rounded-lg transition-all duration-200"
                            style={{borderColor: '#E69AAE'}}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = '#6638E6';
                              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 56, 230, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = '#E69AAE';
                              e.currentTarget.style.boxShadow = '';
                            }}
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
                            className="w-full px-4 py-3 border-2 rounded-lg transition-all duration-200"
                            style={{borderColor: '#E69AAE'}}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = '#6638E6';
                              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 56, 230, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = '#E69AAE';
                              e.currentTarget.style.boxShadow = '';
                            }}
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
                          className="w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 resize-none"
                          style={{borderColor: '#E69AAE'}}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#6638E6';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 56, 230, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#E69AAE';
                            e.currentTarget.style.boxShadow = '';
                          }}
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
                            className="w-full px-4 py-3 border-2 rounded-lg transition-all duration-200"
                            style={{borderColor: '#E69AAE'}}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = '#6638E6';
                              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 56, 230, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = '#E69AAE';
                              e.currentTarget.style.boxShadow = '';
                            }}
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
                            className="w-full px-4 py-3 border-2 rounded-lg transition-all duration-200"
                            style={{borderColor: '#E69AAE'}}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = '#6638E6';
                              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 56, 230, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = '#E69AAE';
                              e.currentTarget.style.boxShadow = '';
                            }}
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
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-4 rounded-lg border" style={{backgroundColor: '#FFE5EC', borderColor: '#E69AAE'}}>
                            <Users style={{color: '#6638E6'}} size={20} />
                            <div>
                              <div className="font-semibold text-gray-800">{item.fullName}</div>
                              <div className="text-sm text-gray-600">Full Name</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-4 rounded-lg border" style={{backgroundColor: '#FFE5EC', borderColor: '#E69AAE'}}>
                            <Mail style={{color: '#6638E6'}} size={20} />
                            <div>
                              <div className="font-semibold text-gray-800">{item.email}</div>
                              <div className="text-sm text-gray-600">Email Address</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-4 rounded-lg border" style={{backgroundColor: '#FFE5EC', borderColor: '#E69AAE'}}>
                            <Calendar style={{color: '#6638E6'}} size={20} />
                            <div>
                              <div className="font-semibold text-gray-800">{item.age} years</div>
                              <div className="text-sm text-gray-600">Age</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-4 rounded-lg border" style={{backgroundColor: '#FFE5EC', borderColor: '#E69AAE'}}>
                            <Phone style={{color: '#6638E6'}} size={20} />
                            <div>
                              <div className="font-semibold text-gray-800">{item.phone}</div>
                              <div className="text-sm text-gray-600">Phone Number</div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-4 rounded-lg border" style={{backgroundColor: '#FFE5EC', borderColor: '#E69AAE'}}>
                            <MapPin style={{color: '#6638E6'}} size={20} />
                            <div>
                              <div className="font-semibold text-gray-800">{item.address}</div>
                              <div className="text-sm text-gray-600">Address</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-4 rounded-lg border" style={{backgroundColor: '#FFE5EC', borderColor: '#E69AAE'}}>
                            <DollarSign style={{color: '#6638E6'}} size={20} />
                            <div>
                              <div className="font-semibold text-gray-800">Rs. {item.salary?.toLocaleString()}</div>
                              <div className="text-sm text-gray-600">Monthly Salary</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-4 rounded-lg border" style={{backgroundColor: '#FFE5EC', borderColor: '#E69AAE'}}>
                            <Users style={{color: '#6638E6'}} size={20} className="mt-1" />
                            <div>
                              <div className="font-semibold text-gray-800">
                                {item.selectedPets && item.selectedPets.length > 0 
                                  ? item.selectedPets.join(', ') 
                                  : 'None'}
                              </div>
                              <div className="text-sm text-gray-600">Selected Pets</div>
                            </div>
                          </div>
                          {item.adminNotes && (
                            <div className="flex items-start gap-3 p-4 rounded-lg border" style={{backgroundColor: '#FFE5EC', borderColor: '#E69AAE'}}>
                              <FileText style={{color: '#6638E6'}} size={20} className="mt-1" />
                              <div>
                                <div className="font-semibold text-gray-800">{item.adminNotes}</div>
                                <div className="text-sm text-gray-600">Admin Notes</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
      </div>
    </div>  
  );
}

export default AdoptionDetailsDisplay;