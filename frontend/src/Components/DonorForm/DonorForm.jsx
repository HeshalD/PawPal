import React, { useState } from 'react';
import { DonationsAPI } from '../../services/api';

// Chatbot Component
const Chatbot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm PawPal Assistant. How can I help you with your donation today? 🐾",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // API Key එක environment variable එකක store කරන්න බැරි නම් state එකේ තියන්න පුළුවන්
  const [apiKey] = useState('AIzaSyBrQWyDCJJevByN18FGtY_OPpfqiHOrgyg');

  const quickReplies = [
    "How much should I donate?",
    "What payment methods are available?",
    "Is my donation tax deductible?",
    "How is my donation used?",
    "Can I make recurring donations?"
  ];

  const getBotResponse = async (userMessage) => {
    // Real Gemini API integration
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are PawPal Assistant, a helpful chatbot for a pet care management system. The user is on our donation page and asked: "${userMessage}". 

              Provide helpful, friendly responses about:
              - Donation amounts (Rs. 1,000 feeds a pet for a week, Rs. 5,000 covers medical checkup, Rs. 10,000 for emergency treatment)
              - Payment methods (Bank Transfer, Credit Card, Mobile Payment, Cash)
              - Tax benefits (donations are tax deductible)
              - How donations are used (directly for pet care, medical treatment, food, shelter)
              - Donation frequency options (one-time, monthly, weekly, yearly)
              
              Keep responses warm, encouraging, and under 100 words. Use pet emojis appropriately.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API Error:', error);
      
      // Fallback responses if API fails
      const fallbackResponses = {
        'donation amount': "Great question! Even Rs. 1,000 can feed a pet for a week. Rs. 5,000 covers a medical checkup, and Rs. 10,000 can help with emergency treatment. Every amount helps! 💝",
        'payment': "We accept Bank Transfer, Credit Card, Mobile Payment, and Cash donations. All methods are secure and reliable! 💳",
        'tax': "Yes! Your donations to PawPal are eligible for tax deductions. We'll provide you with proper receipts for tax purposes. 📄",
        'use': "Your donations go directly to pet care - medical treatment, food, shelter maintenance, and emergency care. We maintain full transparency about fund usage! 🏥",
        'recurring': "Absolutely! You can set up monthly, weekly, or yearly recurring donations. It's a great way to provide ongoing support! 🔄",
        'help': "I can help you with donation amounts, payment methods, tax information, and answer any questions about the donation process! 😊",
        'default': "Sorry, I'm having trouble connecting right now. Please try again or contact our support team for assistance! 🐾"
      };

      const lowerMessage = userMessage.toLowerCase();
      
      if (lowerMessage.includes('amount') || lowerMessage.includes('much')) {
        return fallbackResponses['donation amount'];
      } else if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
        return fallbackResponses['payment'];
      } else if (lowerMessage.includes('tax')) {
        return fallbackResponses['tax'];
      } else if (lowerMessage.includes('use') || lowerMessage.includes('money')) {
        return fallbackResponses['use'];
      } else if (lowerMessage.includes('recurring') || lowerMessage.includes('monthly')) {
        return fallbackResponses['recurring'];
      } else if (lowerMessage.includes('help')) {
        return fallbackResponses['help'];
      } else {
        return fallbackResponses['default'];
      }
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(async () => {
      const botResponse = await getBotResponse(inputMessage);
      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickReply = (reply) => {
    setInputMessage(reply);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-t-2xl flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-purple-500 text-sm">🐾</span>
          </div>
          <div>
            <h3 className="font-semibold">PawPal Assistant</h3>
            <p className="text-xs opacity-90">Online now</p>
          </div>
        </div>
        <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1">
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-xs px-4 py-2 rounded-2xl ${
              message.isBot 
                ? 'bg-gray-100 text-gray-800' 
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
            }`}>
              <p className="text-sm">{message.text}</p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 max-w-xs px-4 py-2 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Replies */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickReplies.slice(0, 3).map((reply, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(reply)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-full transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
          <button
            onClick={sendMessage}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-full hover:from-purple-600 hover:to-pink-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Main DonorForm Component
const DonorForm = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    age: '',
    phone: '',
    NIC: '',
    Email: '',
    Address: '',
    ContributionType: '',
    Amount: '',
    Currency: 'LKR',
    PaymentMethod: '',
    donationFrequency: 'one-time'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [donationId, setDonationId] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSlipForm, setShowSlipForm] = useState(false);
  
  // Chatbot state
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Full name validation
    if (!formData.fullname.trim()) {
      newErrors.fullname = 'Full name is required';
    } else if (formData.fullname.trim().length < 2) {
      newErrors.fullname = 'Full name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.fullname.trim())) {
      newErrors.fullname = 'Full name can only contain letters and spaces';
    }

    // Age validation
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(formData.age) || formData.age < 1 || formData.age > 120) {
      newErrors.age = 'Age must be between 1 and 120';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+94|0)[0-9]{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Sri Lankan phone number (e.g., +94771234567 or 0771234567)';
    }

    // NIC validation
    if (!formData.NIC.trim()) {
      newErrors.NIC = 'NIC is required';
    } else if (!/^[0-9]{9}[vVxX]?$/.test(formData.NIC.trim())) {
      newErrors.NIC = 'Please enter a valid NIC number (e.g., 123456789V)';
    }

    // Email validation
    if (!formData.Email.trim()) {
      newErrors.Email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email.trim())) {
      newErrors.Email = 'Please enter a valid email address';
    }

    // Address validation
    if (!formData.Address.trim()) {
      newErrors.Address = 'Address is required';
    } else if (formData.Address.trim().length < 10) {
      newErrors.Address = 'Address must be at least 10 characters';
    }

    // Contribution type validation
    if (!formData.ContributionType) {
      newErrors.ContributionType = 'Contribution type is required';
    }

    // Amount validation
    if (!formData.Amount) {
      newErrors.Amount = 'Amount is required';
    } else if (isNaN(formData.Amount) || Number(formData.Amount) <= 0) {
      newErrors.Amount = 'Amount must be a positive number';
    }

    // Payment method validation
    if (!formData.PaymentMethod) {
      newErrors.PaymentMethod = 'Payment method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await DonationsAPI.add(formData);
      setDonationId(response.data.donation._id);
      setSubmitted(true);
      setShowSlipForm(true);
    } catch (error) {
      console.error('Error submitting donation:', error);
      alert('Error submitting donation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSlipUpload = async (e) => {
    e.preventDefault();
    const file = e.target.slip.files[0];
    
    if (!file) {
      alert('Please select a file');
      return;
    }

    try {
      await DonationsAPI.uploadSlip(donationId, file);
      alert('Payment slip uploaded successfully!');
      setShowSlipForm(false);
    } catch (error) {
      console.error('Error uploading slip:', error);
      alert('Error uploading slip. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      fullname: '',
      age: '',
      phone: '',
      NIC: '',
      Email: '',
      Address: '',
      ContributionType: '',
      Amount: '',
      Currency: 'LKR',
      PaymentMethod: '',
      donationFrequency: 'one-time'
    });
    setSubmitted(false);
    setDonationId(null);
    setErrors({});
    setShowSlipForm(false);
  };

  if (submitted && !showSlipForm) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-gilroyBold">
              Donation Submitted Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for your generous contribution to PawPal. Your donation ID is: <span className="font-semibold text-purple-600">{donationId}</span>
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setShowSlipForm(true)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                📄 Upload Payment Slip
              </button>
              <button
                onClick={resetForm}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
              >
                Make Another Donation
              </button>
            </div>
          </div>
        </div>
        
        {/* Chatbot */}
        <Chatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
        
        {/* Chatbot Toggle Button */}
        <button
          onClick={() => setIsChatbotOpen(!isChatbotOpen)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </>
    );
  }

  if (showSlipForm) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">📄</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 font-gilroyBold">
                Upload Payment Slip
              </h2>
              <p className="text-gray-600">
                Please upload a clear photo of your payment slip for verification.
              </p>
            </div>
            
            <form onSubmit={handleSlipUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Slip *
                </label>
                <input
                  type="file"
                  name="slip"
                  accept="image/*"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Upload Slip
                </button>
                <button
                  type="button"
                  onClick={() => setShowSlipForm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                >
                  Skip
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Chatbot */}
        <Chatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
        
        {/* Chatbot Toggle Button */}
        <button
          onClick={() => setIsChatbotOpen(!isChatbotOpen)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 font-gilroyBold mb-4">
              💝 Make a Donation
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Help us provide better care for pets. Your donation makes a real difference in the lives of animals.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Benefits Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 font-gilroyBold">
                  🌟 Why Donate?
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Direct Impact</h4>
                      <p className="text-sm text-gray-600">Your donation goes directly to pet care</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Tax Deductible</h4>
                      <p className="text-sm text-gray-600">Eligible for tax deductions</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Transparent</h4>
                      <p className="text-sm text-gray-600">Track how your donation is used</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Flexible</h4>
                      <p className="text-sm text-gray-600">One-time or recurring donations</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">💡 Donation Impact</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rs. 1,000</span>
                      <span className="font-medium text-purple-600">Feeds 1 pet for 1 week</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rs. 5,000</span>
                      <span className="font-medium text-purple-600">Covers medical checkup</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rs. 10,000</span>
                      <span className="font-medium text-purple-600">Emergency treatment</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 font-gilroyBold">
                      👤 Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="fullname"
                          value={formData.fullname}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                            errors.fullname ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Enter your full name"
                        />
                        {errors.fullname && <p className="mt-1 text-sm text-red-600">{errors.fullname}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Age *
                        </label>
                        <input
                          type="number"
                          name="age"
                          value={formData.age}
                          onChange={handleInputChange}
                          min="1"
                          max="120"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                            errors.age ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Enter your age"
                        />
                        {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 font-gilroyBold">
                      📞 Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                            errors.phone ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="+94771234567 or 0771234567"
                        />
                        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="Email"
                          value={formData.Email}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                            errors.Email ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Enter your email address"
                        />
                        {errors.Email && <p className="mt-1 text-sm text-red-600">{errors.Email}</p>}
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        NIC Number *
                      </label>
                      <input
                        type="text"
                        name="NIC"
                        value={formData.NIC}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                          errors.NIC ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="123456789V"
                      />
                      {errors.NIC && <p className="mt-1 text-sm text-red-600">{errors.NIC}</p>}
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <textarea
                        name="Address"
                        value={formData.Address}
                        onChange={handleInputChange}
                        rows={3}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                          errors.Address ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter your complete address"
                      />
                      {errors.Address && <p className="mt-1 text-sm text-red-600">{errors.Address}</p>}
                    </div>
                  </div>

                  {/* Donation Details */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 font-gilroyBold">
                      💎 Donation Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contribution Type *
                        </label>
                        <select
                          name="ContributionType"
                          value={formData.ContributionType}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                            errors.ContributionType ? 'border-red-300' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select contribution type</option>
                          <option value="Medical Care">Medical Care</option>
                          <option value="Food & Supplies">Food & Supplies</option>
                          <option value="Shelter">Shelter</option>
                          <option value="Emergency Fund">Emergency Fund</option>
                          <option value="General Support">General Support</option>
                        </select>
                        {errors.ContributionType && <p className="mt-1 text-sm text-red-600">{errors.ContributionType}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Donation Frequency *
                        </label>
                        <select
                          name="donationFrequency"
                          value={formData.donationFrequency}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="one-time">One-time</option>
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                          <option value="weekly">Weekly</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount *
                        </label>
                        <input
                          type="number"
                          name="Amount"
                          value={formData.Amount}
                          onChange={handleInputChange}
                          min="100"
                          step="100"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                            errors.Amount ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="1000"
                        />
                        {errors.Amount && <p className="mt-1 text-sm text-red-600">{errors.Amount}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Currency
                        </label>
                        <select
                          name="Currency"
                          value={formData.Currency}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="LKR">LKR (Sri Lankan Rupee)</option>
                          <option value="USD">USD (US Dollar)</option>
                          <option value="EUR">EUR (Euro)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Method *
                        </label>
                        <select
                          name="PaymentMethod"
                          value={formData.PaymentMethod}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                            errors.PaymentMethod ? 'border-red-300' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select payment method</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Credit Card">Credit Card</option>
                          <option value="Mobile Payment">Mobile Payment</option>
                          <option value="Cash">Cash</option>
                        </select>
                        {errors.PaymentMethod && <p className="mt-1 text-sm text-red-600">{errors.PaymentMethod}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Submitting...</span>
                        </div>
                      ) : (
                        '💝 Make Donation'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot */}
      <Chatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
      
      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setIsChatbotOpen(!isChatbotOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    </>
  );
};

export default DonorForm;