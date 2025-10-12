import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const history = useNavigate();
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  // Hardcoded admin credentials (consider moving to backend)
  const adminCredentials = {
    'admin@vet.gmail.com': 'vet@pawpal',
    'admin@dataentry.gmail.com': 'dataEntry@pawpal',
    'admin@donation.gmail.com': 'donation@pawpal',
    'admin@adoption.gmail.com': 'adoption@pawpal',
    'admin@inventory.gmail.com': 'inventory@pawpal'
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const checkAdminLogin = (email, password) => {
    const normalizedEmail = email.toLowerCase().trim();
    return adminCredentials[normalizedEmail] === password;
  };

  const isAdminEmail = (email) => {
    const normalizedEmail = email.toLowerCase().trim();
    return Object.keys(adminCredentials).includes(normalizedEmail);
  };

  const getAdminRole = (email) => {
    const normalizedEmail = email.toLowerCase().trim();
    if (normalizedEmail === 'admin@vet.gmail.com') return 'Veterinarian';
    if (normalizedEmail === 'admin@dataentry.gmail.com') return 'Data Entry Operator';
    if (normalizedEmail === 'admin@donation.gmail.com') return 'Donation Manager';
    if (normalizedEmail === 'admin@adoption.gmail.com') return 'Adoption Manager';
    if (normalizedEmail === 'admin@inventory.gmail.com') return 'Inventory Manager';
    return 'Admin';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Check for admin login
      if (isAdminEmail(user.email)) {
        if (checkAdminLogin(user.email, user.password)) {
          const adminData = {
            _id: `admin_${user.email.split('@')[1].split('.')[0]}`,
            email: user.email.toLowerCase(),
            role: getAdminRole(user.email),
            isAdmin: true,
            name: getAdminRole(user.email)
          };

          // Store admin data
          localStorage.setItem('authToken', 'admin_authenticated');
          localStorage.setItem('userData', JSON.stringify(adminData));
          localStorage.setItem('userRole', adminData.role);
          localStorage.setItem('isAdmin', 'true');
          
          alert(`Admin Login Success! Welcome ${adminData.role}!`);
          history("/admin");
          return;
        } else {
          alert("Invalid admin credentials");
          setLoading(false);
          return;
        }
      }

      // Regular user login with JWT
      const response = await axios.post("http://localhost:5000/login", {
        email: user.email.trim(),
        password: user.password,
      });
      
      if (response.data.status === "ok" && response.data.token) {
        // Store JWT token securely
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        localStorage.setItem('userRole', 'User');
        localStorage.setItem('isAdmin', 'false');
        
        // Set default Authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        alert("Login Success! Welcome back!");
        history("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      
      if (err.response?.status === 401) {
        alert("Invalid credentials. Please check your email and password.");
      } else if (err.response?.status === 404) {
        alert("User not found. Please register first.");
      } else if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("Login failed. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-[#6638E6] to-[#E6738F] flex items-center justify-center mb-6 shadow-lg">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#6638E6] to-[#E6738F] bg-clip-text text-transparent mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600">Sign in to your PetCare account</p>
        </div>

        <div className="bg-white shadow-2xl rounded-2xl border border-gray-100 p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                <span className="bg-gradient-to-r from-[#6638E6] to-[#E6738F] bg-clip-text text-transparent">
                  Email Address
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  value={user.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  required
                  disabled={loading}
                  className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6638E6] focus:border-[#6638E6] transition duration-300 placeholder-gray-400 text-gray-900 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                <span className="bg-gradient-to-r from-[#6638E6] to-[#E6738F] bg-clip-text text-transparent">
                  Password
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  name="password"
                  value={user.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6638E6] focus:border-[#6638E6] transition duration-300 placeholder-gray-400 text-gray-900 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {isAdminEmail(user.email) && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-purple-800">
                    Admin Login Detected - {getAdminRole(user.email)}
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-[#6638E6] to-[#E6738F] hover:from-[#5530CC] hover:to-[#E69AAE] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6638E6] transform hover:scale-[1.02] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  {isAdminEmail(user.email) ? 'Admin Sign In' : 'Sign In'}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Don't have an account?{' '}
              <a 
                href="/register" 
                className="font-semibold bg-gradient-to-r from-[#6638E6] to-[#E6738F] bg-clip-text text-transparent hover:from-[#5530CC] hover:to-[#E69AAE] transition duration-200"
              >
                Sign up here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;