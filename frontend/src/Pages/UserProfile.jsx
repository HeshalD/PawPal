import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Nav from "../Components/Nav/Nav";
import { User, Edit, Trash2, Mail, Calendar, Loader, AlertTriangle, Shield, Clock, LogOut, UserCircle } from "lucide-react";

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const [lastLoginAt, setLastLoginAt] = useState(null);
  const [currentLoginAt, setCurrentLoginAt] = useState(null);
  const formatDT = (iso) => {
    try { return iso ? new Date(iso).toLocaleString() : null; } catch { return iso; }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check for authentication token
        const authToken = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (!authToken) {
          alert("Please login to view your profile");
          navigate("/login");
          return;
        }

        // If user data exists in localStorage, use it
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setLastLoginAt(parsedUser.secondLoginTime || null);
          setCurrentLoginAt(parsedUser.loginTime || null);
          setLoading(false);
        } else {
          // Fetch from backend if not in localStorage
          try {
            const response = await axios.get("http://localhost:5000/user/profile", {
              headers: {
                Authorization: `Bearer ${authToken}`
              }
            });
            
            if (response.data.status === "ok" && response.data.user) {
              setUser(response.data.user);
              setLastLoginAt(response.data.user.secondLoginTime || null);
              setCurrentLoginAt(response.data.user.loginTime || null);
              // Save to localStorage for future use
              localStorage.setItem('userData', JSON.stringify(response.data.user));
            } else {
              throw new Error("Failed to load profile");
            }
          } catch (error) {
            console.error("Error fetching profile:", error);
            
            // If token is invalid/expired, redirect to login
            if (error.response?.status === 401) {
              localStorage.clear();
              alert("Session expired. Please login again.");
              navigate("/login");
            } else {
              alert("Error loading profile. Please try again.");
            }
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        alert("Error loading profile");
        navigate("/login");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Logout handler - clears all authentication data
  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    try {
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        await axios.post('http://localhost:5000/logout', {}, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
      }
    } catch (e) {
      // non-blocking
      console.warn('Logout timestamp save failed', e?.message || e);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('userRole');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('loggedInUserId');
      localStorage.removeItem('loggedInUserEmail');
      localStorage.removeItem('userToken');
      alert("Logged out successfully");
      navigate("/login");
    }
  };

  // Delete user - removes from database and redirects to login
  const deleteHandler = async (id) => {
    if (window.confirm("⚠️ WARNING: This will permanently delete your account and all associated data. This action cannot be undone. Are you absolutely sure?")) {
      setDeleteLoading(true);
      try {
        const authToken = localStorage.getItem('authToken');
        
        await axios.delete(`http://localhost:5000/users/${id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });
        
        // Clear all localStorage
        localStorage.clear();
        
        alert("Account deleted successfully");
        navigate("/login");
      } catch (error) {
        console.error("Error deleting user:", error);
        
        if (error.response?.status === 401) {
          alert("Session expired. Please login again.");
          localStorage.clear();
          navigate("/login");
        } else {
          alert("Failed to delete account. Please try again.");
        }
        setDeleteLoading(false);
      }
    }
  };

  const getAccountAge = () => {
    if (!user?.createdAt) return "New Member";
    const diffDays = Math.ceil((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months`;
    return `${Math.ceil(diffDays / 365)} years`;
  };

  const getInitials = () => {
    if (!user) return "U";
    return `${user.Fname?.charAt(0) || ''}${user.Lname?.charAt(0) || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <Nav collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'} p-6`}>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <Loader className="w-20 h-20 text-purple-600 animate-spin" />
                <div className="absolute inset-0 w-20 h-20 border-4 border-purple-200 rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Profile</h3>
              <p className="text-gray-600">Please wait while we fetch your information...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <Nav collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'} p-6`}>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center max-w-md p-10 bg-white rounded-3xl shadow-2xl border border-red-100">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Profile Not Found</h2>
              <p className="text-gray-600 mb-8">Please login to view your profile and access your account.</p>
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition duration-300 shadow-lg transform hover:scale-105"
              >
                <Shield className="w-5 h-5 mr-2" />
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Nav collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'} p-6 md:p-8`}>
        {/* Header with Logout */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              My Profile
            </h1>
            <p className="text-gray-600 text-lg">Manage your account information and settings</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition duration-300"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Profile Card */}
          <div className="xl:col-span-2 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform hover:shadow-3xl transition duration-300">
            {/* Profile Header with Avatar */}
            <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 p-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
              
              <div className="relative flex flex-col md:flex-row items-center md:items-start">
                <div className="w-28 h-28 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center border-4 border-white shadow-2xl mb-4 md:mb-0">
                  <span className="text-4xl font-bold text-white">{getInitials()}</span>
                </div>
                <div className="md:ml-8 text-center md:text-left text-white">
                  <h2 className="text-4xl font-bold mb-2">{user.Fname} {user.Lname}</h2>
                  <div className="flex items-center justify-center md:justify-start space-x-2 mb-3">
                    <Mail className="w-5 h-5 opacity-90" />
                    <p className="text-lg opacity-95">{user.email}</p>
                  </div>
                  <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-sm font-semibold">Active Account</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-8 md:p-10">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mr-3">
                  <UserCircle className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Account Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
                <div className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition duration-300">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition duration-300">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-sm font-medium text-purple-600 uppercase tracking-wide">First Name</p>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{user.Fname}</p>
                </div>
                
                <div className="group p-6 bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-2xl border-2 border-pink-200 hover:border-pink-400 hover:shadow-lg transition duration-300">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-pink-200 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition duration-300">
                      <User className="w-5 h-5 text-pink-600" />
                    </div>
                    <p className="text-sm font-medium text-pink-600 uppercase tracking-wide">Last Name</p>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{user.Lname}</p>
                </div>
                
                <div className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition duration-300">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition duration-300">
                      <Mail className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-sm font-medium text-purple-600 uppercase tracking-wide">Email Address</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900 break-all">{user.email}</p>
                </div>
                
                <div className="group p-6 bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-2xl border-2 border-pink-200 hover:border-pink-400 hover:shadow-lg transition duration-300">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-pink-200 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition duration-300">
                      <Calendar className="w-5 h-5 text-pink-600" />
                    </div>
                    <p className="text-sm font-medium text-pink-600 uppercase tracking-wide">Age</p>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {user.age ? `${user.age} years old` : "Not specified"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t-2 border-gray-100">
                <Link
                  to={`/updateUser/${user._id}`}
                  className="flex-1 flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transform hover:scale-105 transition duration-300 shadow-lg hover:shadow-xl"
                >
                  <Edit className="w-5 h-5 mr-2" />
                  Update Profile
                </Link>
                <button
                  onClick={() => deleteHandler(user._id)}
                  disabled={deleteLoading}
                  className="flex-1 flex items-center justify-center px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl transform hover:scale-105 transition duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {deleteLoading ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5 mr-2" />
                      Delete Account
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform hover:shadow-3xl transition duration-300">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
                <h4 className="text-xl font-bold text-white flex items-center">
                  <Clock className="w-6 h-6 mr-2" />
                  Last Login
                </h4>
              </div>
              <div className="p-6">
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200">
                  <div className="text-sm text-gray-600 mb-1">Previous login date & time</div>
                  <div className="text-lg font-bold text-indigo-700">{formatDT(lastLoginAt) || 'No previous login recorded'}</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform hover:shadow-3xl transition duration-300">
              <div className="bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-5">
                <h4 className="text-xl font-bold text-white flex items-center">
                  <Shield className="w-6 h-6 mr-2" />
                  Quick Actions
                </h4>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  to="/pets"
                  className="flex items-center w-full p-4 text-left bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition duration-300 group"
                >
                  <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition duration-300">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="font-semibold text-gray-800 text-lg">View My Pets</span>
                </Link>
                <Link
                  to="/dashboard"
                  className="flex items-center w-full p-4 text-left bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 rounded-xl border-2 border-pink-200 hover:border-pink-400 transition duration-300 group"
                >
                  <div className="w-10 h-10 bg-pink-200 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition duration-300">
                    <Shield className="w-5 h-5 text-pink-600" />
                  </div>
                  <span className="font-semibold text-gray-800 text-lg">Dashboard</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;