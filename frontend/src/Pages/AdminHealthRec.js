import React, { useState } from 'react';
import { Calendar, Mail, User, Syringe, Activity, FileText, LogIn } from 'lucide-react';

export default function PetMedicalForm() {
  const [formData, setFormData] = useState({
    petName: '',
    ownerName: '',
    ownerEmail: '',
    petType: '',
    diagnosis: '',
    treatment: '',
    vaccination: '',
    visitDate: new Date().toISOString().split('T')[0],
    nextVaccinationDate: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/health-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          petName: formData.petName,
          ownerName: formData.ownerName,
          ownerEmail: formData.ownerEmail,
          petType: formData.petType,
          diagnosis: formData.diagnosis,
          treatment: formData.treatment,
          vaccination: formData.vaccination,
          visitDate: formData.visitDate,
          nextVaccinationDate: formData.nextVaccinationDate
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Pet medical record added successfully!');
        // Reset form
        setFormData({
          petName: '',
          ownerName: '',
          ownerEmail: '',
          petType: '',
          diagnosis: '',
          treatment: '',
          vaccination: '',
          visitDate: new Date().toISOString().split('T')[0],
          nextVaccinationDate: ''
        });
      } else {
        throw new Error(data.message || 'Failed to add record');
      }
    } catch (error) {
      console.error('Pet record submission error:', error);
      if (error.message.includes('required fields')) {
        alert('Please fill all required fields correctly.');
      } else if (error.message.includes('duplicate')) {
        alert('This pet record already exists. Please check the details.');
      } else {
        alert('Failed to add pet record. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 shadow-lg mb-6">
            <Activity className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-3">
            Add Pet Record
          </h1>
          <p className="text-gray-600 text-lg">Enter patient information and medical details</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
          <div className="space-y-6">
            <div>
              <label className="block text-purple-600 font-semibold mb-3 text-sm">
                Pet Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="petName"
                  value={formData.petName}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-2 border-transparent text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-white transition-all"
                  placeholder="Enter pet name"
                />
              </div>
            </div>

            <div>
              <label className="block text-purple-600 font-semibold mb-3 text-sm">
                Owner Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-2 border-transparent text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-white transition-all"
                  placeholder="Enter owner name"
                />
              </div>
            </div>

            <div>
              <label className="block text-purple-600 font-semibold mb-3 text-sm">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  name="ownerEmail"
                  value={formData.ownerEmail}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-2 border-transparent text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-white transition-all"
                  placeholder="Enter owner email address"
                />
              </div>
            </div>

            <div>
              <label className="block text-purple-600 font-semibold mb-3 text-sm">
                Pet Type
              </label>
              <div className="relative">
                <Activity className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  name="petType"
                  value={formData.petType}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-2 border-transparent text-gray-800 focus:outline-none focus:border-purple-400 focus:bg-white transition-all appearance-none"
                >
                  <option value="">Select pet type</option>
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Bird">Bird</option>
                  <option value="Rabbit">Rabbit</option>
                  <option value="Hamster">Hamster</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-purple-600 font-semibold mb-3 text-sm">
                Diagnosis
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 text-gray-400" size={20} />
                <textarea
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleChange}
                  rows="3"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-2 border-transparent text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-white transition-all resize-none"
                  placeholder="Enter diagnosis details"
                />
              </div>
            </div>

            <div>
              <label className="block text-purple-600 font-semibold mb-3 text-sm">
                Treatment
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 text-gray-400" size={20} />
                <textarea
                  name="treatment"
                  value={formData.treatment}
                  onChange={handleChange}
                  rows="3"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-2 border-transparent text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-white transition-all resize-none"
                  placeholder="Enter treatment plan"
                />
              </div>
            </div>

            <div>
              <label className="block text-purple-600 font-semibold mb-3 text-sm">
                Vaccination
              </label>
              <div className="relative">
                <Syringe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="vaccination"
                  value={formData.vaccination}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-2 border-transparent text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-white transition-all"
                  placeholder="Enter vaccination details (optional)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-purple-600 font-semibold mb-3 text-sm">
                  Visit Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="date"
                    name="visitDate"
                    value={formData.visitDate}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-2 border-transparent text-gray-800 focus:outline-none focus:border-purple-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-purple-600 font-semibold mb-3 text-sm">
                  Next Vaccination Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="date"
                    name="nextVaccinationDate"
                    value={formData.nextVaccinationDate}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-2 border-transparent text-gray-800 focus:outline-none focus:border-purple-400 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold text-lg shadow-lg hover:from-[#6638E6] hover:to-[#E6738F] hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn size={20} />
              {loading ? 'Submitting...' : 'Submit Record'}
            </button>
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Need help? <span className="text-pink-500 font-semibold cursor-pointer hover:text-[#E6738F]">Contact support</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}