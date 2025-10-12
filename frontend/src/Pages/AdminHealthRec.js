import React, { useState, useEffect } from 'react';
import { Calendar, Mail, User, Syringe, Activity, FileText, LogIn } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

export default function PetMedicalForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    petName: '',
    ownerName: '',
    ownerEmail: '',
    petType: '',
    diagnosis: '',
    treatment: '',
    vaccination: '',
    visitDate: new Date().toISOString().split('T')[0],
    nextVaccinationDate: '',
    healthStatus: ''
  });

  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errors, setErrors] = useState({});

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const hasDigits = (text) => /\d/.test(text || '');
  const isAlphaName = (text) => /^[A-Za-z][A-Za-z '\-]*$/.test((text || '').trim());

  const validateField = (name, value, currentData = formData) => {
    let error = '';
    const trimmed = typeof value === 'string' ? value.trim() : value;

    if (name === 'ownerName') {
      if (!trimmed) error = 'Owner name is required.';
      else if (trimmed.length < 2) error = 'Owner name must be at least 2 characters.';
      else if (hasDigits(trimmed)) error = 'Owner name cannot contain numbers.';
      else if (!isAlphaName(trimmed)) error = 'Owner name can include letters, spaces, hyphens, and apostrophes only.';
    }

    if (name === 'ownerEmail') {
      if (!trimmed) error = 'Email is required.';
      else if (!isValidEmail(trimmed)) error = 'Enter a valid email address.';
    }

    if (name === 'petType') {
      if (!trimmed) error = 'Pet type is required.';
    }

    if (name === 'diagnosis') {
      if (!trimmed) error = 'Diagnosis is required.';
      else if (trimmed.length < 5) error = 'Diagnosis must be at least 5 characters.';
    }

    if (name === 'treatment') {
      if (!trimmed) error = 'Treatment is required.';
      else if (trimmed.length < 5) error = 'Treatment must be at least 5 characters.';
    }

    if (name === 'visitDate') {
      if (!trimmed) error = 'Visit date is required.';
    }

    if (name === 'nextVaccinationDate') {
      const visit = currentData.visitDate;
      if (trimmed && visit && new Date(trimmed) < new Date(visit)) {
        error = 'Next vaccination must be on or after visit date.';
      }
    }

    if (name === 'petName') {
      if (!trimmed) error = 'Pet name is missing for this record.';
      else if (hasDigits(trimmed)) error = 'Pet name cannot contain numbers.';
      else if (!isAlphaName(trimmed)) error = 'Pet name can include letters, spaces, hyphens, and apostrophes only.';
    }

    if (name === 'healthStatus') {
      if (!trimmed) error = 'Health status is required.';
    }

    return error;
  };

  const validateAll = (data = formData) => {
    const newErrors = {};
    Object.keys(data).forEach((key) => {
      const maybeError = validateField(key, data[key], data);
      if (maybeError) newErrors[key] = maybeError;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const fetchPet = async () => {
      if (!id) {
        alert('No pet ID provided');
        navigate('/vetpetview');
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/pets/${id}`);
        
        if (response.ok) {
          const data = await response.json();
          const petData = data.pet || data;
          
          setFormData(prev => ({
            ...prev,
            petName: petData.petName || petData.name || '',
            ownerName: petData.ownerName || '',
            ownerEmail: petData.ownerEmail || '',
            petType: petData.petType || ''
          }));
        } else {
          alert('Failed to fetch pet details');
          navigate('/vetpetview');
        }
      } catch (error) {
        console.error('Error fetching pet:', error);
        alert('Failed to fetch pet data. Please try again.');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchPet();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      const fieldError = validateField(name, value, next);
      setErrors((prevErrors) => ({ ...prevErrors, [name]: fieldError }));
      if (name === 'visitDate' && next.nextVaccinationDate) {
        const crossError = validateField('nextVaccinationDate', next.nextVaccinationDate, next);
        setErrors((prevErrors) => ({ ...prevErrors, nextVaccinationDate: crossError }));
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const isValid = validateAll();
    if (!isValid) {
      setLoading(false);
      return;
    }
    
    const recordData = {
      petId: id,
      petName: formData.petName,
      ownerName: formData.ownerName,
      ownerEmail: formData.ownerEmail,
      petType: formData.petType,
      diagnosis: formData.diagnosis,
      treatment: formData.treatment,
      vaccination: formData.vaccination,
      visitDate: formData.visitDate,
      nextVaccinationDate: formData.nextVaccinationDate,
      healthStatus: formData.healthStatus,
    };

    console.log("Submitting health record:", recordData);
    
    try {
      const response = await fetch("http://localhost:5000/health-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recordData),
      });

      console.log("Response status:", response.status);
      
      let data;
      try {
        data = await response.json();
        console.log("Response data:", data);
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        throw new Error("Invalid response from server");
      }

      if (response.ok) {
        alert("Pet medical record added successfully!");
        navigate("/vetpetview");
      } else {
        console.error("Server error:", data);
        throw new Error(data.message || data.error || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error("Pet record submission error:", error);
      
      if (error.message.includes("Failed to fetch")) {
        alert("Cannot connect to server. Please check if the backend is running on http://localhost:5000");
      } else if (error.message.includes("required fields")) {
        alert("Please fill all required fields correctly.");
      } else if (error.message.includes("duplicate")) {
        alert("This pet record already exists. Please check the details.");
      } else if (error.message.includes("Invalid response")) {
        alert("Server returned an invalid response. Check the console for details.");
      } else {
        alert(`Failed to add pet record: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading pet data...</p>
        </div>
      </div>
    );
  }

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
                  readOnly
                  className={`w-full pl-12 pr-4 py-4 rounded-xl bg-gray-100 border-2 ${errors.petName ? 'border-red-400' : 'border-gray-200'} text-gray-700 cursor-not-allowed`}
                  placeholder="Pet name"
                />
              </div>
              {errors.petName && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.petName}</p>
              )}
              <p className="text-xs text-gray-500 mt-1 ml-1">This field is auto-filled and cannot be edited</p>
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
                  pattern="[A-Za-z][A-Za-z '\-]*"
                  inputMode="text"
                  className={`w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-2 ${errors.ownerName ? 'border-red-400 focus:border-red-500' : 'border-transparent focus:border-purple-400'} text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white transition-all`}
                  placeholder="Enter owner name"
                  required
                />
              </div>
              {errors.ownerName && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.ownerName}</p>
              )}
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
                  className={`w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-2 ${errors.ownerEmail ? 'border-red-400 focus:border-red-500' : 'border-transparent focus:border-purple-400'} text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white transition-all`}
                  placeholder="Enter owner email address"
                  required
                />
              </div>
              {errors.ownerEmail && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.ownerEmail}</p>
              )}
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
                  className={`w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-2 ${errors.petType ? 'border-red-400 focus:border-red-500' : 'border-transparent focus:border-purple-400'} text-gray-800 focus:outline-none focus:bg-white transition-all appearance-none`}
                  required
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
              {errors.petType && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.petType}</p>
              )}
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
                  className={`w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-2 ${errors.diagnosis ? 'border-red-400 focus:border-red-500' : 'border-transparent focus:border-purple-400'} text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white transition-all resize-none`}
                  placeholder="Enter diagnosis details"
                  required
                />
              </div>
              {errors.diagnosis && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.diagnosis}</p>
              )}
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
                  className={`w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-2 ${errors.treatment ? 'border-red-400 focus:border-red-500' : 'border-transparent focus:border-purple-400'} text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white transition-all resize-none`}
                  placeholder="Enter treatment plan"
                  required
                />
              </div>
              {errors.treatment && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.treatment}</p>
              )}
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

            <div>
              <label className="block text-purple-600 font-semibold mb-3 text-sm">
                Health Status <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-4">
                {['Healthy', 'Normal', 'Weak'].map((status) => (
                  <label
                    key={status}
                    className={`flex items-center px-6 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.healthStatus === status
                        ? 'border-purple-500 bg-purple-50'
                        : errors.healthStatus
                        ? 'border-red-400 bg-gray-50'
                        : 'border-gray-200 bg-gray-50 hover:border-purple-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="healthStatus"
                      value={status}
                      checked={formData.healthStatus === status}
                      onChange={handleChange}
                      className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                      required
                    />
                    <span className={`ml-3 font-medium ${
                      formData.healthStatus === status ? 'text-purple-700' : 'text-gray-700'
                    }`}>
                      {status}
                    </span>
                  </label>
                ))}
              </div>
              {errors.healthStatus && (
                <p className="text-red-500 text-xs mt-2 ml-1">{errors.healthStatus}</p>
              )}
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
                    className={`w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-2 ${errors.visitDate ? 'border-red-400 focus:border-red-500' : 'border-transparent focus:border-purple-400'} text-gray-800 focus:outline-none focus:bg-white transition-all`}
                    required
                  />
                </div>
                {errors.visitDate && (
                  <p className="text-red-500 text-xs mt-1 ml-1">{errors.visitDate}</p>
                )}
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
                    className={`w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-2 ${errors.nextVaccinationDate ? 'border-red-400 focus:border-red-500' : 'border-transparent focus:border-purple-400'} text-gray-800 focus:outline-none focus:bg-white transition-all`}
                  />
                </div>
                {errors.nextVaccinationDate && (
                  <p className="text-red-500 text-xs mt-1 ml-1">{errors.nextVaccinationDate}</p>
                )}
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