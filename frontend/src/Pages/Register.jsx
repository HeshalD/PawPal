import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const history = useNavigate();
  const [user, setUser] = useState({
    Fname: "",
    Lname: "",
    email: "",
    password: "",
    confirmpassword: "",
    age: "",
    terms: false,
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    const newErrors = {};

    // Name validation
    if (!user.Fname.trim()) newErrors.Fname = "First name is required";
    else if (!/^[A-Za-z]+$/.test(user.Fname)) newErrors.Fname = "First name can only contain letters";

    if (!user.Lname.trim()) newErrors.Lname = "Last name is required";
    else if (!/^[A-Za-z]+$/.test(user.Lname)) newErrors.Lname = "Last name can only contain letters";

    // Email validation
    if (!user.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(user.email)) newErrors.email = "Email is invalid";

    // Age validation
    if (!user.age) newErrors.age = "Age is required";
    else if (user.age <= 0) newErrors.age = "Age must be positive";

    // Password validation
if (!user.password) newErrors.password = "Password is required";
else if (user.password.length < 6)
  newErrors.password = "Password must be at least 6 characters";
else if (!/[A-Z]/.test(user.password))
  newErrors.password = "Password must contain at least one uppercase letter";
else if (!/[!@#$%^&*(),.?":{}|<>]/.test(user.password))
  newErrors.password = "Password must contain at least one special character";

// Confirm password validation
if (!user.confirmpassword) newErrors.confirmpassword = "Confirm password is required";
else if (user.password !== user.confirmpassword) newErrors.confirmpassword = "Passwords do not match";


    // Terms validation
    if (!user.terms) newErrors.terms = "You must accept terms and conditions";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    sendRequest()
      .then(() => {
        alert("Register Success");
        history("/login");
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  const sendRequest = async () => {
    return await axios
      .post("http://localhost:5000/register", {
        Fname: String(user.Fname),
        Lname: String(user.Lname),
        email: String(user.email),
        password: String(user.password),
        confirmpassword: String(user.confirmpassword),
        age: Number(user.age),
      })
      .then((res) => res.data);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-[#6638E6] to-[#E6738F] flex items-center justify-center mb-6">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-600">Join us today and start your journey</p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#6638E6] via-[#E6738F] to-[#E69AAE] px-8 py-6">
            <h3 className="text-xl font-semibold text-white text-center">Registration Form</h3>
            <p className="text-white/80 text-sm text-center mt-1">Please fill in all required fields</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="Fname" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="Fname"
                    value={user.Fname}
                    onChange={handleInputChange}
                    placeholder="First Name"
                    className={`block w-full pl-3 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition duration-200 placeholder-gray-400 ${
                      errors.Fname ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#6638E6]"
                    }`}
                  />
                  {errors.Fname && <p className="text-red-600 text-sm mt-1">{errors.Fname}</p>}
                </div>

                <div>
                  <label htmlFor="Lname" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="Lname"
                    value={user.Lname}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                    className={`block w-full pl-3 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition duration-200 placeholder-gray-400 ${
                      errors.Lname ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#6638E6]"
                    }`}
                  />
                  {errors.Lname && <p className="text-red-600 text-sm mt-1">{errors.Lname}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={user.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className={`block w-full pl-3 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition duration-200 placeholder-gray-400 ${
                    errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#6638E6]"
                  }`}
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Age */}
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={user.age}
                  onChange={handleInputChange}
                  placeholder="Enter your age"
                  className={`block w-full pl-3 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition duration-200 placeholder-gray-400 ${
                    errors.age ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#6638E6]"
                  }`}
                />
                {errors.age && <p className="text-red-600 text-sm mt-1">{errors.age}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={user.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className={`block w-full pl-3 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition duration-200 placeholder-gray-400 ${
                    errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#6638E6]"
                  }`}
                />
                {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmpassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmpassword"
                  value={user.confirmpassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className={`block w-full pl-3 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition duration-200 placeholder-gray-400 ${
                    errors.confirmpassword ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#6638E6]"
                  }`}
                />
                {errors.confirmpassword && <p className="text-red-600 text-sm mt-1">{errors.confirmpassword}</p>}
              </div>

              {/* Terms */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={user.terms}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#6638E6] bg-gray-100 border-gray-300 rounded focus:ring-[#6638E6] focus:ring-2"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-gray-700">
                    I agree to the{' '}
                    <a href="#" className="text-[#6638E6] hover:text-[#5530CC] font-medium">
                      Terms and Conditions
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-[#6638E6] hover:text-[#5530CC] font-medium">
                      Privacy Policy
                    </a>
                  </label>
                  {errors.terms && <p className="text-red-600 text-sm mt-1">{errors.terms}</p>}
                </div>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#6638E6] to-[#E6738F] hover:from-[#5530CC] hover:to-[#E69AAE] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6638E6] transform hover:scale-[1.02] transition duration-200"
              >
                Create Account
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="font-medium text-[#6638E6] hover:text-[#5530CC] transition duration-200">
                  Sign in here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
