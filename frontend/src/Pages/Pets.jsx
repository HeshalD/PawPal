import React, { useEffect, useState } from "react";
import axios from "axios";
import Nav from "../Components/Nav/Nav";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Edit, Trash2, Eye, Calendar, Award } from "lucide-react";

function DisplayPet() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  // Fetch pets from backend
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await axios.get("http://localhost:5000/pets");
        setPets(response.data.pets); // Make sure backend sends {pets: [...]}
      } catch (error) {
        console.error("Error fetching pets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  // Delete pet
  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure you want to delete this pet?")) {
      try {
        await axios.delete(`http://localhost:5000/pets/${id}`);
        // Remove deleted pet from state
        setPets(pets.filter((pet) => pet._id !== id));
      } catch (error) {
        console.error("Error deleting pet:", error);
        alert("Failed to delete pet. Please try again.");
      }
    }
  };

  // Navigate to pet profile
  const handlePetCardClick = (petId) => {
    navigate(`/pet-profile/${petId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Nav collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'} p-6`}>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-4 text-gray-600">Loading pets...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!pets || pets.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Nav collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'} p-6`}>
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Pets Found</h2>
            <p className="text-gray-600 mb-6">Start by adding your first pet to the system.</p>
            <Link
              to="/addpet"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Add First Pet
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <Nav collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content */}
      <div className={`p-6`}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Pet Management</h1>
          <p className="text-gray-600">Manage and view all registered pets in the system</p>
        </div>

        {/* Stats Bar */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-8 border border-purple-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{pets.length}</p>
                <p className="text-sm text-gray-600">Total Pets</p>
              </div>
              <div className="h-12 w-px bg-gray-300"></div>
              <div className="text-center">
                <p className="text-3xl font-bold text-pink-600">
                  {pets.filter(pet => pet.healthStatus === 'Excellent' || pet.health === 'Excellent').length}
                </p>
                <p className="text-sm text-gray-600">Healthy Pets</p>
              </div>
            </div>
            <Link
              to="/addpet"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Heart className="w-5 h-5 mr-2" />
              Add New Pet
            </Link>
          </div>
        </div>

        {/* Pet Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pets.map((pet) => (
            <div
              key={pet._id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 overflow-hidden transform hover:scale-105 transition-all duration-300 cursor-pointer group"
            >
              {/* Pet Image */}
              <div 
                className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden"
                onClick={() => handlePetCardClick(pet._id)}
              >
                {pet.image ? (
                  <img
                    src={pet.image}
                    alt={pet.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Heart className="w-16 h-16 text-purple-300" />
                  </div>
                )}
                
                {/* Health Status Badge */}
                <div className="absolute top-3 right-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                    (pet.healthStatus || pet.health) === 'Excellent' ? 'bg-green-500' :
                    (pet.healthStatus || pet.health) === 'Good' ? 'bg-blue-500' :
                    (pet.healthStatus || pet.health) === 'Very Good' ? 'bg-emerald-500' :
                    'bg-gray-500'
                  }`}>
                    {pet.healthStatus || pet.health || 'Unknown'}
                  </div>
                </div>
              </div>

              {/* Pet Info */}
              <div className="p-6">
                <div className="mb-4" onClick={() => handlePetCardClick(pet._id)}>
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                    {pet.name}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                      <span>{pet.age} years old</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="w-4 h-4 mr-2 text-pink-500" />
                      <span>{pet.breed}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handlePetCardClick(pet._id)}
                    className="flex items-center px-3 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all duration-200"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">View</span>
                  </button>

                  <div className="flex space-x-2">
                    <Link to={`/pets/${pet._id}`}>
                      <button className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200">
                        <Edit className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">Edit</span>
                      </button>
                    </Link>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteHandler(pet._id);
                      }}
                      className="flex items-center px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Showing {pets.length} pets • Click on any pet card to view detailed profile</p>
        </div>
      </div>
    </div>
  );
}

export default DisplayPet;