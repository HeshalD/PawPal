import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { SponsorsAPI, toImageUrl } from '../../services/api';

const validationSchema = Yup.object({
  sponsorName: Yup.string().required('Required'),
  companyName: Yup.string().nullable(),
  email: Yup.string().email('Invalid email').required('Required'),
  phone: Yup.string().required('Required'),
  address: Yup.string().nullable(),
  durationMonths: Yup.number().oneOf([3,6,9,12,0.001], 'Invalid duration').required('Required'),
  sponsorAmount: Yup.number().min(50000, 'Minimum amount is 50,000').required('Required'),
  adImage: Yup.mixed().nullable(),
});

export default function SponsorForm() {
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState(null);

  const formik = useFormik({
    initialValues: {
      sponsorName: '',
      companyName: '',
      email: '',
      phone: '',
      address: '',
      durationMonths: 3,
      sponsorAmount: '',
      adImage: null,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setError(null);
      
      // DEBUG: Log form values
      console.log('Form values before submission:', values);
      console.log('sponsorAmount type:', typeof values.sponsorAmount);
      console.log('sponsorAmount value:', values.sponsorAmount);
      
      try {
        const fd = new FormData();
        fd.append('sponsorName', values.sponsorName);
        if (values.companyName) fd.append('companyName', values.companyName);
        fd.append('email', values.email);
        fd.append('phone', values.phone);
        if (values.address) fd.append('address', values.address);
        fd.append('durationMonths', String(values.durationMonths));
        
        // Ensure sponsorAmount is converted to number and then to string for FormData
        const sponsorAmountNumber = Number(values.sponsorAmount);
        console.log('sponsorAmount as number:', sponsorAmountNumber);
        fd.append('sponsorAmount', String(sponsorAmountNumber));
        
        if (values.adImage) fd.append('adImage', values.adImage);

        // DEBUG: Log FormData contents
        console.log('FormData contents:');
        for (let [key, value] of fd.entries()) {
          console.log(`${key}:`, value, typeof value);
        }

        const { data } = await SponsorsAPI.create(fd);
        console.log('API response:', data);
        setSubmitted(data.sponsor);
        resetForm();
      } catch (e) {
        console.error('Submit error:', e);
        setError(e?.response?.data?.message || 'Submit failed');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 font-gilroyBold mb-4">
            🤝 Become a PawPal Sponsor
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join our mission to provide better care for pets. Your sponsorship helps us make a difference in the lives of animals.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Benefits Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 font-gilroyBold">
                🌟 Sponsor Benefits
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Brand Visibility</h4>
                    <p className="text-sm text-gray-600">Your logo displayed on our platform</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Community Impact</h4>
                    <p className="text-sm text-gray-600">Direct contribution to pet welfare</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Tax Benefits</h4>
                    <p className="text-sm text-gray-600">Eligible for tax deductions</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Flexible Duration</h4>
                    <p className="text-sm text-gray-600">Choose from 3, 6, 9, or 12 months</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">💡 Sponsorship Tiers</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bronze (3 months)</span>
                    <span className="font-medium text-purple-600">Rs. 50,000+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Silver (6 months)</span>
                    <span className="font-medium text-purple-600">Rs. 100,000+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gold (9 months)</span>
                    <span className="font-medium text-purple-600">Rs. 150,000+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platinum (12 months)</span>
                    <span className="font-medium text-purple-600">Rs. 200,000+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <form onSubmit={formik.handleSubmit} className="space-y-6">
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
                        name="sponsorName"
                        value={formik.values.sponsorName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                          formik.touched.sponsorName && formik.errors.sponsorName
                            ? 'border-red-300'
                            : 'border-gray-300'
                        }`}
                        placeholder="Enter your full name"
                      />
                      {formik.touched.sponsorName && formik.errors.sponsorName && (
                        <p className="mt-1 text-sm text-red-600">{formik.errors.sponsorName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={formik.values.companyName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter company name (optional)"
                      />
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
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                          formik.touched.email && formik.errors.email
                            ? 'border-red-300'
                            : 'border-gray-300'
                        }`}
                        placeholder="Enter your email address"
                      />
                      {formik.touched.email && formik.errors.email && (
                        <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formik.values.phone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                          formik.touched.phone && formik.errors.phone
                            ? 'border-red-300'
                            : 'border-gray-300'
                        }`}
                        placeholder="Enter your phone number"
                      />
                      {formik.touched.phone && formik.errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{formik.errors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formik.values.address}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your address (optional)"
                    />
                  </div>
                </div>

                {/* Sponsorship Details */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 font-gilroyBold">
                    💎 Sponsorship Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration *
                      </label>
                      <select
                        name="durationMonths"
                        value={formik.values.durationMonths}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                          formik.touched.durationMonths && formik.errors.durationMonths
                            ? 'border-red-300'
                            : 'border-gray-300'
                        }`}
                      >
                        <option value={3}>3 months - Bronze Tier</option>
                        <option value={6}>6 months - Silver Tier</option>
                        <option value={9}>9 months - Gold Tier</option>
                        <option value={12}>12 months - Platinum Tier</option>
                        <option value={0.001}>1 minute (testing only)</option>
                      </select>
                      {formik.touched.durationMonths && formik.errors.durationMonths && (
                        <p className="mt-1 text-sm text-red-600">{formik.errors.durationMonths}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sponsor Amount (Rs.) *
                      </label>
                      <input
                        type="number"
                        name="sponsorAmount"
                        value={formik.values.sponsorAmount}
                        onChange={(e) => {
                          const value = e.target.value;
                          formik.setFieldValue('sponsorAmount', value);
                        }}
                        onBlur={formik.handleBlur}
                        min="50000"
                        step="1000"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                          formik.touched.sponsorAmount && formik.errors.sponsorAmount
                            ? 'border-red-300'
                            : 'border-gray-300'
                        }`}
                        placeholder="Minimum Rs. 50,000"
                      />
                      {formik.touched.sponsorAmount && formik.errors.sponsorAmount && (
                        <p className="mt-1 text-sm text-red-600">{formik.errors.sponsorAmount}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ad Image Upload */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 font-gilroyBold">
                    🖼️ Advertisement Image
                  </h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors duration-200">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => formik.setFieldValue('adImage', e.currentTarget.files[0])}
                      className="hidden"
                      id="adImage"
                    />
                    <label
                      htmlFor="adImage"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xl">📷</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formik.values.adImage ? formik.values.adImage.name : 'Click to upload ad image'}
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="text-red-400">⚠️</div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <div className="mt-2 text-sm text-red-700">{error}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={formik.isSubmitting}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                  >
                    {formik.isSubmitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      '🤝 Become a Sponsor'
                    )}
                  </button>
                </div>
              </form>

              {/* Success Message */}
              {submitted && (
                <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex">
                    <div className="text-green-400 text-2xl">✅</div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-green-800 mb-2">
                        Application Submitted Successfully!
                      </h3>
                      <p className="text-green-700 mb-4">
                        Thank you for your interest in sponsoring PawPal. Your application is now under review.
                      </p>
                      <div className="bg-white rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-900">Name:</span>
                          <span className="text-gray-700">{submitted.sponsorName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-900">Duration:</span>
                          <span className="text-gray-700">
                            {submitted.durationMonths === 0.001 ? '1 minute (testing)' : `${submitted.durationMonths} months`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-900">Amount:</span>
                          <span className="text-purple-600 font-semibold">Rs. {Number(submitted.sponsorAmount).toLocaleString()}</span>
                        </div>
                        {submitted.adImagePath && (
                          <div className="mt-4">
                            <img 
                              src={toImageUrl(submitted.adImagePath)} 
                              alt="Ad preview" 
                              className="w-full max-w-xs mx-auto rounded-lg shadow-md"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}