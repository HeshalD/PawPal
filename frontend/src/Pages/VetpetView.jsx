import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Heart, Edit, Search } from "lucide-react";
import Nav from "../Components/Nav/NavAdmin";

function VetPetView() {
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Fetch pets from backend
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await axios.get("http://localhost:5000/pets");
        const petsData = response.data.pets || [];
        setPets(petsData);
        setFilteredPets(petsData);
      } catch (error) {
        console.error("Error fetching pets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchTerm) {
      const filtered = pets.filter(pet =>
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPets(filtered);
    } else {
      setFilteredPets(pets);
    }
  }, [searchTerm, pets]);

  // Calculate statistics
  const totalPets = pets.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Nav collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'} p-8`}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-pink-500" />
            <h1 className="text-4xl font-bold text-gray-900">Pet Management</h1>
          </div>
          <p className="text-gray-600 text-lg">PawPal Pet Care System</p>
        </div>

        {/* Statistics Card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Total Pets</p>
                <p className="text-4xl font-bold">{totalPets}</p>
              </div>
              <Heart className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm font-medium mb-1">Dogs</p>
                <p className="text-4xl font-bold">
                  {pets.filter(p => p.species?.toLowerCase() === 'dog').length}
                </p>
              </div>
              <span className="text-5xl opacity-80">🐕</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Cats</p>
                <p className="text-4xl font-bold">
                  {pets.filter(p => p.species?.toLowerCase() === 'cat').length}
                </p>
              </div>
              <span className="text-5xl opacity-80">🐈</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium mb-1">Others</p>
                <p className="text-4xl font-bold">
                  {pets.filter(p => 
                    p.species?.toLowerCase() !== 'dog' && 
                    p.species?.toLowerCase() !== 'cat'
                  ).length}
                </p>
              </div>
              <span className="text-5xl opacity-80">🐾</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="🔍 Search pets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-lg"
            />
          </div>
        </div>

        {/* Pets Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">
                Pets ({filteredPets.length})
              </h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-50 border-b-2 border-purple-100">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-sm">
                    Pet Name
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-sm">
                    Breed
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-sm">
                    Age
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-sm">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPets.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-12">
                      <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-500 mb-2">No Pets Found</h3>
                      <p className="text-gray-400">Try adjusting your search criteria</p>
                    </td>
                  </tr>
                ) : (
                  filteredPets.map((pet, index) => (
                    <tr 
                      key={pet._id} 
                      className={`border-b border-gray-100 hover:bg-purple-50 transition-colors duration-150 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      {/* Pet Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                            {pet.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{pet.name}</div>
                            <div className="text-sm text-gray-500">{pet.species || 'Not specified'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Breed */}
                      <td className="py-4 px-6">
                        <span className="text-gray-700 font-medium">{pet.breed}</span>
                      </td>

                      {/* Age */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                          {pet.age} {pet.age === 1 ? 'year' : 'years'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6">
                        <button
                          onClick={() => navigate(`/adminHealthRec/${pet._id}`)}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg shadow-md transform hover:scale-105 transition-all duration-200 font-medium"
                        >
                          <Edit className="w-4 h-4" />
                          Update
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {filteredPets.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredPets.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{totalPets}</span> pets
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VetPetView;