import React, { useState } from "react";

function DonationForm() {
  const [form, setForm] = useState({
    fullName: "",
    age: "",
    phoneNumber: "",
    email: "",
    nicNumber: "",
    address: "",
    contributionType: "",
    donationFrequency: "One-time",
    amount: "1000",
    currency: "LKR (Sri Lanka)",
    paymentMethod: ""
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Handle form submission here
    console.log("Donation form submitted:", form);
    setTimeout(() => {
      setSubmitting(false);
      alert("Thank you for your donation!");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-purple-800">Make a Donation</h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Help us provide better care for pets. Your donation makes a real difference in the lives of animals.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Why Donate? */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-6">
              <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Why Donate?</h2>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Direct Impact: Your donation goes directly to pet care</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Tax Deductible: Eligible for tax deductions</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Transparent: Track how your donation is used</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Flexible: One time or recurring donations</span>
              </div>
            </div>

            {/* Donation Impact */}
            <div className="bg-purple-100 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center mr-2">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-purple-800">Donation Impact</h3>
              </div>
              <div className="space-y-2 text-sm text-purple-700">
                <p>Rs 1,000 Feeds 1 pet for 1 week</p>
                <p>Rs 5,000 Covers medical checkup</p>
                <p>Rs 10,000 Emergency treatment</p>
              </div>
            </div>
          </div>

          {/* Right Panel - Donation Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age *
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={form.age}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter your age"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Contact Information</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={form.phoneNumber}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="+94771234567 or 0771234567"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NIC Number *
                    </label>
                    <input
                      type="text"
                      name="nicNumber"
                      value={form.nicNumber}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="123456789V"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      placeholder="Enter your complete address"
                      rows={3}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Donation Details */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Donation Details</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contribution Type *
                    </label>
                    <select
                      name="contributionType"
                      value={form.contributionType}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="">Select contribution type</option>
                      <option value="monetary">Monetary Donation</option>
                      <option value="supplies">Pet Supplies</option>
                      <option value="volunteer">Volunteer Time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Donation Frequency *
                    </label>
                    <select
                      name="donationFrequency"
                      value={form.donationFrequency}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="One-time">One-time</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="100"
                      step="100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={form.currency}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="LKR (Sri Lanka)">LKR (Sri Lanka)</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method *
                    </label>
                    <select
                      name="paymentMethod"
                      value={form.paymentMethod}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="">Select payment method</option>
                      <option value="credit-card">Credit Card</option>
                      <option value="bank-transfer">Bank Transfer</option>
                      <option value="paypal">PayPal</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center"
              >
                <svg className="w-5 h-5 text-white mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                {submitting ? "Processing..." : "Make Donation"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DonationForm;
