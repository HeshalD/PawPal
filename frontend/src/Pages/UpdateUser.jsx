import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Nav from "../Components/Nav/Nav";
import { Link } from "react-router-dom";
import axios from "axios";
import { User, Mail, Lock, Calendar, Save, X, Eye, EyeOff, Loader, AlertTriangle } from "lucide-react";

function UpdateUser() {
  const [collapsed, setCollapsed] = useState(false);
  const { id } = useParams(); // Get user ID from URL
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    Fname: "",
    Lname: "",
    email: "",
    password: "",
    confirmpassword: "",
    age: ""
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch user data by ID when component mounts
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/users/${id}`);
        const userData = res.data.users || res.data.user || res.data;
        setInputs({
          Fname: userData.Fname || "",
          Lname: userData.Lname || "",
          email: userData.email || "",
          password: userData.password || "",
          confirmpassword: userData.password || "",
          age: userData.age || ""
        });
      } catch (err) {
        console.error("Error fetching user:", err);
        alert("Failed to load user data");
        navigate("/displayUser");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // First name validation
    if (!inputs.Fname.trim()) {
      newErrors.Fname = "First name is required";
    }

    // Last name validation
    if (!inputs.Lname.trim()) {
      newErrors.Lname = "Last name is required";
    }

    // Email validation
    if (!inputs.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(inputs.email)) {
      newErrors.email = "Email format is invalid";
    }

    // Password validation
    if (!inputs.password) {
      newErrors.password = "Password is required";
    } else if (inputs.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (!inputs.confirmpassword) {
      newErrors.confirmpassword = "Please confirm your password";
    } else if (inputs.password !== inputs.confirmpassword) {
      newErrors.confirmpassword = "Passwords do not match";
    }

    // Age validation
    if (!inputs.age) {
      newErrors.age = "Age is required";
    } else if (inputs.age < 1 || inputs.age > 120) {
      newErrors.age = "Age must be between 1 and 120";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      await axios.put(`http://localhost:5000/users/${id}`, {
        Fname: inputs.Fname.trim(),
        Lname: inputs.Lname.trim(),
        email: inputs.email.trim(),
        password: inputs.password,
        age: Number(inputs.age)
      });
      alert("User updated successfully!");
      navigate("/userprofile");
    } catch (err) {
      console.error("Error updating user:", err);
      const errorMessage = err.response?.data?.message || "Failed to update user. Please try again.";
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <Nav collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'} p-6`}>
      <div 
        className="min-h-screen bg-white flex items-center justify-center"
        style={{ marginLeft: collapsed ? "5rem" : "16rem" }}
      >
        <div className="text-center">
          <Loader className="w-16 h-16 text-[#6638E6] animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading user data...</p>
        </div>
      </div>
      </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <Nav collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'} p-6`}>
    <div 
      className="min-h-screen bg-white p-6 md:p-12"
      style={{ marginLeft: collapsed ? "5rem" : "16rem" }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#6638E6] to-[#E6738F] bg-clip-text text-transparent mb-2">
            Update User Profile
          </h1>
          <p className="text-gray-600">Update user information and account details</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-[#6638E6] to-[#E6738F] px-8 py-6">
            <div className="flex items-center text-white">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white">
                <User className="w-8 h-8" />
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold">Edit User Information</h2>
                <p className="text-sm opacity-90">Update the form below to modify user details</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-[#6638E6]" />
                      First Name *
                    </span>
                  </label>
                  <input
                    type="text"
                    name="Fname"
                    value={inputs.Fname}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#6638E6] focus:border-[#6638E6] transition duration-300 bg-gray-50 focus:bg-white ${
                      errors.Fname ? 'border-red-500' : 'border-gray-200'
                    }`}
                    required
                  />
                  {errors.Fname && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      {errors.Fname}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-[#E6738F]" />
                      Last Name *
                    </span>
                  </label>
                  <input
                    type="text"
                    name="Lname"
                    value={inputs.Lname}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#6638E6] focus:border-[#6638E6] transition duration-300 bg-gray-50 focus:bg-white ${
                      errors.Lname ? 'border-red-500' : 'border-gray-200'
                    }`}
                    required
                  />
                  {errors.Lname && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      {errors.Lname}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-[#6638E6]" />
                    Email Address *
                  </span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={inputs.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#6638E6] focus:border-[#6638E6] transition duration-300 bg-gray-50 focus:bg-white ${
                    errors.email ? 'border-red-500' : 'border-gray-200'
                  }`}
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="flex items-center">
                      <Lock className="w-4 h-4 mr-2 text-[#6638E6]" />
                      Password *
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={inputs.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                      className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:ring-2 focus:ring-[#6638E6] focus:border-[#6638E6] transition duration-300 bg-gray-50 focus:bg-white ${
                        errors.password ? 'border-red-500' : 'border-gray-200'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="flex items-center">
                      <Lock className="w-4 h-4 mr-2 text-[#E6738F]" />
                      Confirm Password *
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmpassword"
                      value={inputs.confirmpassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:ring-2 focus:ring-[#6638E6] focus:border-[#6638E6] transition duration-300 bg-gray-50 focus:bg-white ${
                        errors.confirmpassword ? 'border-red-500' : 'border-gray-200'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmpassword && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      {errors.confirmpassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-[#6638E6]" />
                    Age *
                  </span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={inputs.age}
                  onChange={handleChange}
                  placeholder="Enter age"
                  min="1"
                  max="120"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#6638E6] focus:border-[#6638E6] transition duration-300 bg-gray-50 focus:bg-white ${
                    errors.age ? 'border-red-500' : 'border-gray-200'
                  }`}
                  required
                />
                {errors.age && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {errors.age}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#6638E6] to-[#E6738F] text-white rounded-xl hover:from-[#5530CC] hover:to-[#E69AAE] transform hover:scale-105 transition duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Update User
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/userprofile")}
                disabled={submitting}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transform hover:scale-105 transition duration-300 shadow-lg disabled:opacity-50"
              >
                <X className="w-5 h-5 mr-2" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </div>
    </div>
  );
}

export default UpdateUser;