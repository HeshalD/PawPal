import React, { useEffect, useState } from "react";
import axios from "axios";
import Nav from '../Components/Nav/Nav';
import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import {
  User,
  Edit3,
  Trash2,
  Heart,
  Mail,
  Calendar,
  UserCheck,
  Save,
  X,
  Clock,
  Award,
  PawPrint,
  Shield,
  Eye,
  EyeOff,
  Loader,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

function UserProfile() {
  const [user, setUser] = useState(null);
  const [userPets, setUserPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [editFormData, setEditFormData] = useState({
    Fname: "",
    Lname: "",
    email: "",
    password: "",
    confirmpassword: "",
    age: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    initializeProfile();
  }, []);

  const testBackendConnection = async () => {
    try {
      const response = await axios.get("http://localhost:5000/test");
      console.log("Backend connection test:", response.data);
      return true;
    } catch (error) {
      console.error("Backend connection failed:", error);
      return false;
    }
  };

  const initializeProfile = async () => {
    try {
      const isConnected = await testBackendConnection();
      if (!isConnected) console.warn("Backend connection issues detected");

      const currentUserData = localStorage.getItem('currentUser');
      const userId = localStorage.getItem('loggedInUserId');
      const userEmail = localStorage.getItem('loggedInUserEmail');

      if (currentUserData) {
        const userData = JSON.parse(currentUserData);
        setUser(userData);
        setEditFormData({
          Fname: userData.Fname || "",
          Lname: userData.Lname || "",
          email: userData.email || "",
          password: "",
          confirmpassword: "",
          age: userData.age || ""
        });
        await fetchUserPets(userData._id);
      } else if (userId || userEmail) {
        await fetchUserByIdOrEmail(userId, userEmail);
      } else {
        handleNoAuth();
      }
    } catch (error) {
      console.error("Error initializing profile:", error);
      handleNoAuth();
    } finally {
      setLoading(false);
    }
  };

  const handleNoAuth = () => {
    alert("Please login to view your profile");
    navigate("/login");
  };

  const fetchUserByIdOrEmail = async (userId, userEmail) => {
    try {
      let userData = null;

      if (userId) {
        try {
          const response = await axios.get(`http://localhost:5000/users/${userId}`);
          userData = response.data.user || response.data.users || response.data;
        } catch (error) {
          console.log("Failed to fetch by ID, trying email approach");
        }
      }

      if (!userData && userEmail) {
        const response = await axios.get("http://localhost:5000/users");
        const allUsers = response.data.users || response.data;
        userData = allUsers.find(u => u.email.toLowerCase() === userEmail.toLowerCase());
      }

      if (userData) {
        setUser(userData);
        setEditFormData({
          Fname: userData.Fname || "",
          Lname: userData.Lname || "",
          email: userData.email || "",
          password: "",
          confirmpassword: "",
          age: userData.age || ""
        });
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('loggedInUserId', userData._id);
        await fetchUserPets(userData._id);
      } else {
        alert("User profile not found");
        navigate("/login");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      alert("Error loading profile");
      navigate("/login");
    }
  };

  const fetchUserPets = async (userId) => {
    if (!userId) return;
    try {
      const response = await axios.get(`http://localhost:5000/pets/user/${userId}`);
      setUserPets(response.data.pets || []);
    } catch (error) {
      try {
        const allPetsResponse = await axios.get("http://localhost:5000/pets");
        const userSpecificPets = allPetsResponse.data.pets?.filter(pet =>
          pet.userId === userId || pet.owner === userId || pet.createdBy === userId
        ) || [];
        setUserPets(userSpecificPets);
      } catch (error) {
        console.log("No pets found for user");
        setUserPets([]);
      }
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!editFormData.Fname.trim()) {
      errors.Fname = "First name is required";
    }

    if (!editFormData.Lname.trim()) {
      errors.Lname = "Last name is required";
    }

    if (!editFormData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(editFormData.email)) {
      errors.email = "Email format is invalid";
    }

    if (editFormData.password && editFormData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (editFormData.password && editFormData.password !== editFormData.confirmpassword) {
      errors.confirmpassword = "Passwords do not match";
    }

    if (editFormData.age && (editFormData.age < 1 || editFormData.age > 120)) {
      errors.age = "Age must be between 1 and 120";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    if (!user || !user._id) {
      alert("User data not available");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setUpdateLoading(true);
    
    try {
      const updateData = {
        Fname: editFormData.Fname.trim(),
        Lname: editFormData.Lname.trim(),
        email: editFormData.email.trim(),
        age: editFormData.age ? Number(editFormData.age) : (user.age || null)
      };

      // Only include password if it's provided
      if (editFormData.password.trim()) {
        updateData.password = editFormData.password.trim();
      }

      const response = await axios.put(`http://localhost:5000/users/${user._id}`, updateData);
      const updatedUser = response.data.user || response.data.users || response.data.updatedUser || response.data.data || response.data;

      const completeUpdatedUser = { ...user, ...updatedUser, _id: user._id };
      setUser(completeUpdatedUser);
      localStorage.setItem("currentUser", JSON.stringify(completeUpdatedUser));
      localStorage.setItem("loggedInUserEmail", completeUpdatedUser.email);
      
      setIsEditing(false);
      setEditFormData(prev => ({ ...prev, password: "", confirmpassword: "" }));
      alert("Profile updated successfully!");
      
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert("Error updating profile. Please try again.");
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user || !user._id) {
      alert("User data not available");
      return;
    }

    const confirmDelete = window.confirm(
      "⚠️ WARNING: This action cannot be undone!\n\nThis will permanently delete your account and all related data including:\n• Your profile information\n• All your pet profiles\n• Your activity history\n\nAre you absolutely sure you want to proceed?"
    );
    
    if (!confirmDelete) return;

    const finalConfirm = window.confirm(
      "Last confirmation: Type 'DELETE' in the next prompt to confirm account deletion."
    );
    
    if (!finalConfirm) return;

    const userInput = prompt("Please type 'DELETE' to confirm:");
    if (userInput !== 'DELETE') {
      alert("Account deletion cancelled - confirmation text did not match.");
      return;
    }

    setDeleteLoading(true);
    
    try {
      await axios.delete(`http://localhost:5000/users/${user._id}`);
      localStorage.clear();
      alert("Account deleted successfully. We're sorry to see you go!");
      navigate("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Error deleting account. Please try again or contact support.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditFormData({
      Fname: user.Fname || "",
      Lname: user.Lname || "",
      email: user.email || "",
      password: "",
      confirmpassword: "",
      age: user.age || ""
    });
    setFormErrors({});
    setIsEditing(false);
  };

  const getAccountAge = () => {
    if (!user?.createdAt) return "New Member";
    const diffDays = Math.ceil((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Joined Today";
    if (diffDays === 1) return "1 day";
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months`;
    return `${Math.ceil(diffDays / 365)} years`;
  };

  const getJoinDate = () => {
    if (!user?.createdAt) return "Unknown";
    return new Date(user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-white">
        <Nav collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={`p-6`}>
          <div>
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-[#6638E6] mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#6638E6] to-[#E6738F] bg-clip-text text-transparent mb-2">
              Loading Your Profile...
            </h2>
            <p className="text-gray-600">Please wait while we fetch your information</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen bg-white">
        <Nav collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'} flex items-center justify-center`}>
          <div className="text-center max-w-md p-8 bg-white rounded-3xl shadow-2xl border border-gray-100">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4 text-red-600">Profile Not Found</h2>
            <p className="text-gray-600 mb-6">We couldn't load your profile information. This might be due to a session timeout or connection issue.</p>
            <Link 
              to="/login" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#6638E6] to-[#E6738F] text-white rounded-xl hover:from-[#5530CC] hover:to-[#E69AAE] transform hover:scale-105 transition duration-300 shadow-lg"
            >
              <Shield className="w-5 h-5 mr-2" /> 
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Nav collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`p-8`}>
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#6638E6] to-[#E6738F] bg-clip-text text-transparent mb-2">
              My Profile
            </h1>
            <p className="text-gray-600 text-lg">Manage your account settings and view your activity</p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            {!isEditing ? (
              <>
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#6638E6] to-[#E6738F] text-white rounded-xl hover:from-[#5530CC] hover:to-[#E69AAE] transform hover:scale-105 transition duration-300 shadow-lg"
                  disabled={updateLoading || deleteLoading}
                >
                  <Edit3 className="w-5 h-5 mr-2"/> 
                  Edit Profile
                </button>
                <button 
                  onClick={handleDeleteUser} 
                  className="flex items-center justify-center px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transform hover:scale-105 transition duration-300 shadow-lg"
                  disabled={updateLoading || deleteLoading}
                >
                  {deleteLoading ? (
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5 mr-2" />
                  )}
                  {deleteLoading ? 'Deleting...' : 'Delete Account'}
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleUpdateUser} 
                  className="flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transform hover:scale-105 transition duration-300 shadow-lg"
                  disabled={updateLoading}
                >
                  {updateLoading ? (
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5 mr-2" />
                  )}
                  {updateLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  onClick={handleCancelEdit} 
                  className="flex items-center justify-center px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transform hover:scale-105 transition duration-300 shadow-lg"
                  disabled={updateLoading}
                >
                  <X className="w-5 h-5 mr-2"/> 
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Profile Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
            
            {/* Profile Header */}
            <div className="relative bg-gradient-to-br from-[#6638E6] via-[#7B46E7] to-[#E6738F] px-8 py-10">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5"></div>
              <div className="relative flex items-center">
                <div className="relative">
                  <div className="w-28 h-28 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white shadow-2xl">
                    <User className="w-14 h-14 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-400 rounded-full border-4 border-white flex items-center justify-center shadow-xl">
                    <UserCheck className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-8 text-white">
                  <h2 className="text-4xl font-bold mb-1">{user.Fname} {user.Lname}</h2>
                  <p className="flex items-center text-lg mb-3 opacity-90">
                    <Mail className="w-5 h-5 mr-3"/> 
                    {user.email}
                  </p>
                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <span className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      <Clock className="w-4 h-4 mr-2"/> 
                      Member for {getAccountAge()}
                    </span>
                    <span className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      <Award className="w-4 h-4 mr-2"/> 
                      Pet Enthusiast
                    </span>
                    <span className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      <PawPrint className="w-4 h-4 mr-2"/> 
                      {userPets.length} Pets
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-8">
              {!isEditing ? (
                // View Mode
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 hover:shadow-lg hover:border-[#6638E6]/20 transition duration-300">
                      <div className="flex items-center mb-2">
                        <User className="w-5 h-5 text-[#6638E6] mr-2" />
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">First Name</p>
                      </div>
                      <p className="text-xl font-bold text-gray-900">{user.Fname}</p>
                    </div>
                    
                    <div className="group p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 hover:shadow-lg hover:border-[#6638E6]/20 transition duration-300">
                      <div className="flex items-center mb-2">
                        <User className="w-5 h-5 text-[#E6738F] mr-2" />
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Last Name</p>
                      </div>
                      <p className="text-xl font-bold text-gray-900">{user.Lname}</p>
                    </div>
                    
                    <div className="group p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 hover:shadow-lg hover:border-[#6638E6]/20 transition duration-300">
                      <div className="flex items-center mb-2">
                        <Mail className="w-5 h-5 text-[#6638E6] mr-2" />
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Email Address</p>
                      </div>
                      <p className="text-xl font-bold text-gray-900 break-all">{user.email}</p>
                    </div>
                    
                    <div className="group p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 hover:shadow-lg hover:border-[#6638E6]/20 transition duration-300">
                      <div className="flex items-center mb-2">
                        <Calendar className="w-5 h-5 text-[#E6738F] mr-2" />
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Age</p>
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        {user.age ? `${user.age} years old` : "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <form onSubmit={handleUpdateUser} className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        <span className="bg-gradient-to-r from-[#6638E6] to-[#E6738F] bg-clip-text text-transparent">
                          First Name *
                        </span>
                      </label>
                      <input
                        type="text"
                        name="Fname"
                        value={editFormData.Fname}
                        onChange={handleInputChange}
                        placeholder="Enter your first name"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#6638E6] focus:border-[#6638E6] transition duration-300 bg-gray-50 focus:bg-white ${
                          formErrors.Fname ? 'border-red-500' : 'border-gray-200'
                        }`}
                        required
                      />
                      {formErrors.Fname && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {formErrors.Fname}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        <span className="bg-gradient-to-r from-[#6638E6] to-[#E6738F] bg-clip-text text-transparent">
                          Last Name *
                        </span>
                      </label>
                      <input
                        type="text"
                        name="Lname"
                        value={editFormData.Lname}
                        onChange={handleInputChange}
                        placeholder="Enter your last name"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#6638E6] focus:border-[#6638E6] transition duration-300 bg-gray-50 focus:bg-white ${
                          formErrors.Lname ? 'border-red-500' : 'border-gray-200'
                        }`}
                        required
                      />
                      {formErrors.Lname && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {formErrors.Lname}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <span className="bg-gradient-to-r from-[#6638E6] to-[#E6738F] bg-clip-text text-transparent">
                        Email Address *
                      </span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editFormData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#6638E6] focus:border-[#6638E6] transition duration-300 bg-gray-50 focus:bg-white ${
                        formErrors.email ? 'border-red-500' : 'border-gray-200'
                      }`}
                      required
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        <span className="bg-gradient-to-r from-[#6638E6] to-[#E6738F] bg-clip-text text-transparent">
                          New Password (Optional)
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={editFormData.password}
                          onChange={handleInputChange}
                          placeholder="Enter new password (leave empty to keep current)"
                          className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:ring-2 focus:ring-[#6638E6] focus:border-[#6638E6] transition duration-300 bg-gray-50 focus:bg-white ${
                            formErrors.password ? 'border-red-500' : 'border-gray-200'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {formErrors.password && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {formErrors.password}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        <span className="bg-gradient-to-r from-[#6638E6] to-[#E6738F] bg-clip-text text-transparent">
                          Confirm New Password
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmpassword"
                          value={editFormData.confirmpassword}
                          onChange={handleInputChange}
                          placeholder="Confirm new password"
                          className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:ring-2 focus:ring-[#6638E6] focus:border-[#6638E6] transition duration-300 bg-gray-50 focus:bg-white ${
                            formErrors.confirmpassword ? 'border-red-500' : 'border-gray-200'
                          }`}
                          disabled={!editFormData.password}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                          disabled={!editFormData.password}
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {formErrors.confirmpassword && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {formErrors.confirmpassword}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <span className="bg-gradient-to-r from-[#6638E6] to-[#E6738F] bg-clip-text text-transparent">
                        Age (Optional)
                      </span>
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={editFormData.age}
                      onChange={handleInputChange}
                      placeholder="Enter your age"
                      min="1"
                      max="120"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#6638E6] focus:border-[#6638E6] transition duration-300 bg-gray-50 focus:bg-white ${
                        formErrors.age ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {formErrors.age && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {formErrors.age}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                    <button 
                      type="submit" 
                      className="flex items-center justify-center px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition duration-300 shadow-lg"
                      disabled={updateLoading}
                    >
                      {updateLoading ? (
                        <>
                          <Loader className="w-5 h-5 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button 
                      type="button" 
                      onClick={handleCancelEdit} 
                      className="flex items-center justify-center px-8 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transform hover:scale-105 transition duration-300 shadow-lg"
                      disabled={updateLoading}
                    >
                      <X className="w-5 h-5 mr-2" />
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* User Pets Section */}
            {!isEditing && (
              <div className="px-8 pb-8 border-t border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">My Pets</h3>
                  <span className="bg-gradient-to-r from-[#6638E6] to-[#E6738F] text-white px-4 py-2 rounded-full text-sm font-semibold">
                    {userPets.length} Pet{userPets.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {userPets.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {userPets.map((pet) => (
                      <div 
                        key={pet._id} 
                        className="group bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-[#6638E6]/30 transform hover:scale-105 transition duration-300"
                      >
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#6638E6] to-[#E6738F] rounded-full flex items-center justify-center shadow-lg">
                            <PawPrint className="w-6 h-6 text-white" />
                          </div>
                          <div className="ml-4">
                            <h4 className="text-xl font-bold text-gray-900">{pet.name}</h4>
                            <p className="text-sm text-gray-500 capitalize">{pet.type || 'Pet'}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Breed:</span>
                            <span className="font-semibold text-gray-900">{pet.breed}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Age:</span>
                            <span className="font-semibold text-gray-900">{pet.age} years</span>
                          </div>
                          {pet.health && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Health:</span>
                              <span className={`font-semibold ${
                                pet.health === 'Excellent' ? 'text-green-600' :
                                pet.health === 'Good' ? 'text-blue-600' :
                                'text-yellow-600'
                              }`}>
                                {pet.health}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <button className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-[#6638E6]/10 to-[#E6738F]/10 text-[#6638E6] rounded-lg hover:from-[#6638E6]/20 hover:to-[#E6738F]/20 transition duration-300 group-hover:shadow-md">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <PawPrint className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-gray-500 mb-2">No Pets Yet</h4>
                    <p className="text-gray-400 mb-6">You haven't registered any pets. Start by adding your first furry friend!</p>
                    <Link 
                      to="/pet-management" 
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#6638E6] to-[#E6738F] text-white rounded-xl hover:from-[#5530CC] hover:to-[#E69AAE] transform hover:scale-105 transition duration-300 shadow-lg"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      <Link to="/addpet">
                      Add Your First Pet
                      </Link>
                     </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Stats and Info */}
          <div className="space-y-6">
            
            {/* Account Statistics */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#6638E6] to-[#E6738F] px-6 py-4">
                <h4 className="text-xl font-bold text-white">Account Statistics</h4>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-[#6638E6] mr-3" />
                    <span className="text-gray-600">Email</span>
                  </div>
                  <span className="font-semibold text-gray-900 text-sm truncate max-w-32">
                    {user.email}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-[#E6738F] mr-3" />
                    <span className="text-gray-600">Joined</span>
                  </div>
                  <span className="font-semibold text-gray-900 text-sm">
                    {getJoinDate()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <PawPrint className="w-5 h-5 text-[#6638E6] mr-3" />
                    <span className="text-gray-600">Total Pets</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {userPets.length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-[#E6738F] mr-3" />
                    <span className="text-gray-600">Active Since</span>
                  </div>
                  <span className="font-semibold text-gray-900 text-sm">
                    {getAccountAge()}
                  </span>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#E6738F] to-[#E69AAE] px-6 py-4">
                <h4 className="text-xl font-bold text-white">Achievements</h4>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                    <Award className="w-8 h-8 text-yellow-500 mr-3" />
                    <div>
                      <h5 className="font-semibold text-yellow-800">Pet Lover</h5>
                      <p className="text-sm text-yellow-600">Registered your account</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-red-50 rounded-xl border border-red-200">
                    <Heart className="w-8 h-8 text-red-500 mr-3" />
                    <div>
                      <h5 className="font-semibold text-red-800">Community Member</h5>
                      <p className="text-sm text-red-600">Part of PetCare family</p>
                    </div>
                  </div>
                  
                  {userPets.length > 0 && (
                    <div className="flex items-center p-3 bg-green-50 rounded-xl border border-green-200">
                      <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                      <div>
                        <h5 className="font-semibold text-green-800">Pet Parent</h5>
                        <p className="text-sm text-green-600">Registered {userPets.length} pet{userPets.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  )}
                  
                  {userPets.length >= 3 && (
                    <div className="flex items-center p-3 bg-purple-50 rounded-xl border border-purple-200">
                      <PawPrint className="w-8 h-8 text-purple-500 mr-3" />
                      <div>
                        <h5 className="font-semibold text-purple-800">Pet Collector</h5>
                        <p className="text-sm text-purple-600">3+ pets registered</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#6638E6] to-[#7B46E7] px-6 py-4">
                <h4 className="text-xl font-bold text-white">Quick Actions</h4>
              </div>
              <div className="p-6 space-y-3">
                <Link 
                  to="/pet-management" 
                  className="flex items-center w-full p-3 text-left bg-gray-50 hover:bg-gradient-to-r hover:from-[#6638E6]/10 hover:to-[#E6738F]/10 rounded-xl transition duration-300 group"
                >
                  <PawPrint className="w-5 h-5 text-[#6638E6] mr-3 group-hover:scale-110 transition duration-300" />
                  <span className="font-medium text-gray-700 group-hover:text-[#6638E6]">
                    <Link to="pets">Manage Pets</Link>
                    
                  </span>
                </Link>
                
                <Link 
                  to="/dashboard" 
                  className="flex items-center w-full p-3 text-left bg-gray-50 hover:bg-gradient-to-r hover:from-[#6638E6]/10 hover:to-[#E6738F]/10 rounded-xl transition duration-300 group"
                >
                  <User className="w-5 h-5 text-[#E6738F] mr-3 group-hover:scale-110 transition duration-300" />
                  <span className="font-medium text-gray-700 group-hover:text-[#E6738F]">
                    Dashboard
                  </span>
                </Link>
                
                <button 
                  onClick={() => {
                    localStorage.clear();
                    navigate('/login');
                  }}
                  className="flex items-center w-full p-3 text-left bg-red-50 hover:bg-red-100 rounded-xl transition duration-300 group"
                >
                  <Shield className="w-5 h-5 text-red-500 mr-3 group-hover:scale-110 transition duration-300" />
                  <span className="font-medium text-red-600 group-hover:text-red-700">
                    Sign Out
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;