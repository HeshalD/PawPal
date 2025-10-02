import React, { useEffect, useState } from "react";
import axios from "axios";
import Nav from "../Components/Nav/NavAdmin";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Edit, Trash2, Eye, Search, Filter, Download, Plus } from "lucide-react";

function DisplayPet() {
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortBy, setSortBy] = useState("None");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  // Fetch pets from backend
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await axios.get("http://localhost:5000/pets");
        setPets(response.data.pets || []);
        setFilteredPets(response.data.pets || []);
      } catch (error) {
        console.error("Error fetching pets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = [...pets];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(pet =>
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.species.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== "All") {
      filtered = filtered.filter(pet => pet.species === filterCategory);
    }

    // Sort functionality
    if (sortBy === "Name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "Age") {
      filtered.sort((a, b) => a.age - b.age);
    } else if (sortBy === "Species") {
      filtered.sort((a, b) => a.species.localeCompare(b.species));
    }

    setFilteredPets(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterCategory, sortBy, pets]);

  // Delete pet
  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure you want to delete this pet?")) {
      try {
        await axios.delete(`http://localhost:5000/pets/${id}`);
        setPets(pets.filter((pet) => pet._id !== id));
      } catch (error) {
        console.error("Error deleting pet:", error);
        alert("Failed to delete pet. Please try again.");
      }
    }
  };

  // Get unique species for filter dropdown
  const uniqueSpecies = [...new Set(pets.map(pet => pet.species))];

  // Pagination
  const totalPages = Math.ceil(filteredPets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPets = filteredPets.slice(startIndex, startIndex + itemsPerPage);

  // Export to PDF (placeholder function)
  const exportToPDF = () => {
    // Implementation for PDF export
    console.log("Export to PDF functionality");
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Nav collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'} p-6`}>
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pets</h1>
              <p className="text-gray-600 mt-1">View and manage all registered pets</p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search pets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                >
                  <option value="All">All Species</option>
                  {uniqueSpecies.map(species => (
                    <option key={species} value={species}>{species}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                >
                  <option value="None">None</option>
                  <option value="Name">Name</option>
                  <option value="Age">Age</option>
                  <option value="Species">Species</option>
                </select>
              </div>

              {/* Export */}
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export PDF</span>
              </button>

              {/* Add New Pet */}
              <Link
                to="/adminaddpet"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add New Pet</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Pets List</h2>
              <span className="text-sm opacity-90">
                Showing {Math.min(startIndex + 1, filteredPets.length)} - {Math.min(startIndex + itemsPerPage, filteredPets.length)} of {filteredPets.length} pets
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-pink-100 border-b border-pink-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Pet Image</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Pet Name</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Pet ID</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Species</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Breed</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Age</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Health Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPets.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-12">
                      <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-500 mb-2">No Pets Found</h3>
                      <p className="text-gray-400">Try adjusting your search or filter criteria</p>
                    </td>
                  </tr>
                ) : (
                  currentPets.map((pet, index) => (
                    <tr key={pet._id} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      {/* Pet Image */}
                      <td className="py-4 px-6">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                          {pet.image ? (
                            <img
                              src={pet.image}
                              alt={pet.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Heart className="w-6 h-6 text-purple-400" />
                          )}
                        </div>
                      </td>

                      {/* Pet Name */}
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-semibold text-gray-900">{pet.name}</div>
                          <div className="text-sm text-gray-500">{pet.gender || 'Not specified'}</div>
                        </div>
                      </td>

                      {/* Pet ID */}
                      <td className="py-4 px-6">
                        <span className="text-gray-600">#{pet._id.slice(-6)}</span>
                      </td>

                      {/* Species */}
                      <td className="py-4 px-6">
                        <span className="text-gray-700">{pet.species}</span>
                      </td>

                      {/* Breed */}
                      <td className="py-4 px-6">
                        <span className="text-gray-700">{pet.breed}</span>
                      </td>

                      {/* Age */}
                      <td className="py-4 px-6">
                        <span className="text-gray-700">{pet.age} years</span>
                      </td>

                      {/* Health Status */}
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          (pet.healthStatus || pet.health) === 'Excellent' ? 'bg-green-100 text-green-800' :
                          (pet.healthStatus || pet.health) === 'Good' ? 'bg-blue-100 text-blue-800' :
                          (pet.healthStatus || pet.health) === 'Very Good' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {pet.healthStatus || pet.health || 'Unknown'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          pet.adoptionStatus === 'Available' ? 'bg-green-100 text-green-800' :
                          pet.adoptionStatus === 'Adopted' ? 'bg-blue-100 text-blue-800' :
                          pet.adoptionStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {pet.adoptionStatus || 'Available'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/adminpetprofile/${pet._id}`)}
                            className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all duration-200"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <Link to={`/adminupdatepet/${pet._id}`}>
                            <button
                              className="p-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-all duration-200"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </Link>

                          <button
                            onClick={() => deleteHandler(pet._id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 text-sm rounded ${
                      currentPage === i + 1
                        ? 'bg-purple-500 text-white'
                        : 'border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DisplayPet;