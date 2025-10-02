import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import { PawPrint, ArrowLeft, Edit } from "lucide-react";

function AdminUpdatePet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    name: "",
    age: "",
    breed: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch pet by ID
  useEffect(() => {
    const fetchPet = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/pets/${id}`);
        setInputs(res.data.pet || res.data); // backend should return { pet: {...} }
      } catch (err) {
        console.error("Error fetching pet:", err);
        alert("Failed to fetch pet data. Please try again.");
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchPet();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Submit updated pet
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await axios.put(`http://localhost:5000/pets/${id}`, {
        ...inputs,
        age: Number(inputs.age), // make sure age is a number
      });
      alert("Pet updated successfully!");
      navigate("/adminpets"); // redirect back to pet list
    } catch (err) {
      console.error("Error updating pet:", err);
      alert("Failed to update pet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="h-screen bg-white overflow-y-auto">
        {/* Header */}
        <header className="bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg">
          <div className="w-full px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <PawPrint className="h-8 w-8 text-white" />
                <h1 className="text-2xl font-bold text-white">PawPal</h1>
              </div>
              <Link 
                to="/adminpets" 
                className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Pets</span>
              </Link>
            </div>
          </div>
        </header>
        
        {/* Loading State */}
        <main className="flex-1 px-6 py-8">
          <div className="max-w-md mx-auto h-full flex flex-col justify-center">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-8 py-16 text-center">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Loading pet data...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white overflow-y-auto">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <PawPrint className="h-8 w-8 text-white" />
              <h1 className="text-2xl font-bold text-white">PawPal</h1>
            </div>
            <Link 
              to="/adminpets" 
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Pets</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-md mx-auto h-full flex flex-col justify-center">
          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-400 px-8 py-6">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Edit className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Update Pet</h2>
                  <p className="text-purple-100 text-sm">Edit your pet's information</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="px-8 py-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Pet Name Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pet Name
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    value={inputs.name} 
                    onChange={handleChange} 
                    placeholder="Enter your pet's name" 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>

                {/* Pet Age Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pet Age
                  </label>
                  <input 
                    type="number" 
                    name="age" 
                    value={inputs.age} 
                    onChange={handleChange} 
                    placeholder="Enter age in years" 
                    required 
                    min="0"
                    max="30"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>

                {/* Pet Breed Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Breed
                  </label>
                  <input 
                    type="text" 
                    name="breed" 
                    value={inputs.breed} 
                    onChange={handleChange} 
                    placeholder="Enter pet's breed" 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating Pet...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Edit className="h-5 w-5" />
                      <span>Update Pet</span>
                    </div>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
              Changes will be saved immediately after updating.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminUpdatePet;