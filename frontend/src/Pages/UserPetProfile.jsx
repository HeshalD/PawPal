import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Nav from "../Components/Nav/Nav";
import {
  Heart,
  Calendar,
  Award,
  Activity,
  Syringe,
  FileText,
  ArrowLeft,
  User,
  Mail,
  Clock,
  AlertCircle,
  CheckCircle,
  PawPrint
} from "lucide-react";

function PetProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [pet, setPet] = useState(null);
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(true);

  // Fetch pet details
  useEffect(() => {
    const fetchPet = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/pets/${id}`);
        const petData = res.data.pet || res.data;
        setPet(petData);
      } catch (err) {
        console.error("Error fetching pet:", err);
        alert("Failed to load pet details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [id]);

  // Fetch health records for this pet
  useEffect(() => {
    const fetchHealthRecords = async () => {
      try {
        const response = await axios.get("http://localhost:5000/health-records");
        const allRecords = response.data.healthRecords || response.data || [];
        
        // Filter records for this specific pet
        const petRecords = allRecords.filter(
          record => record.petName?.toLowerCase() === pet?.name?.toLowerCase()
        );
        
        setHealthRecords(petRecords);
      } catch (error) {
        console.error("Error fetching health records:", error);
      } finally {
        setRecordsLoading(false);
      }
    };

    if (pet) {
      fetchHealthRecords();
    }
  }, [pet]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Nav collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'} p-6`}>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-4 text-gray-600">Loading pet profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-white">
        <Nav collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'} p-6`}>
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Pet Not Found</h2>
            <p className="text-gray-600 mb-6">The pet you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate("/pets")}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Pets
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Nav collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'} p-8`}>
        {/* Back Button */}
        <button
          onClick={() => navigate("/pets")}
          className="flex items-center text-purple-600 hover:text-purple-700 mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Pets
        </button>

        {/* Pet Details Section */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 p-8 text-white">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Pet Image */}
              <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center">
                {pet.image ? (
                  <img
                    src={pet.image}
                    alt={pet.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Heart className="w-16 h-16 text-white" />
                )}
              </div>

              {/* Pet Basic Info */}
              <div className="text-center md:text-left">
                <h1 className="text-4xl font-bold mb-2">{pet.name}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm">
                  <span className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <PawPrint className="w-4 h-4 mr-2" />
                    {pet.species || 'Unknown Species'}
                  </span>
                  <span className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Award className="w-4 h-4 mr-2" />
                    {pet.breed}
                  </span>
                  <span className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    {pet.age} years old
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pet Details Grid */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Pet Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Gender */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                <div className="flex items-center mb-2">
                  <User className="w-5 h-5 text-purple-600 mr-2" />
                  <p className="text-sm font-semibold text-purple-900 uppercase tracking-wide">Gender</p>
                </div>
                <p className="text-xl font-bold text-gray-900">{pet.gender || 'Not specified'}</p>
              </div>

              {/* Species */}
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 border border-pink-200">
                <div className="flex items-center mb-2">
                  <PawPrint className="w-5 h-5 text-pink-600 mr-2" />
                  <p className="text-sm font-semibold text-pink-900 uppercase tracking-wide">Species</p>
                </div>
                <p className="text-xl font-bold text-gray-900">{pet.species}</p>
              </div>

              {/* Breed */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center mb-2">
                  <Award className="w-5 h-5 text-blue-600 mr-2" />
                  <p className="text-sm font-semibold text-blue-900 uppercase tracking-wide">Breed</p>
                </div>
                <p className="text-xl font-bold text-gray-900">{pet.breed}</p>
              </div>

              {/* Age */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                <div className="flex items-center mb-2">
                  <Calendar className="w-5 h-5 text-green-600 mr-2" />
                  <p className="text-sm font-semibold text-green-900 uppercase tracking-wide">Age</p>
                </div>
                <p className="text-xl font-bold text-gray-900">{pet.age} years</p>
              </div>

              {/* Health Status */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200">
                <div className="flex items-center mb-2">
                  <Activity className="w-5 h-5 text-emerald-600 mr-2" />
                  <p className="text-sm font-semibold text-emerald-900 uppercase tracking-wide">Health Status</p>
                </div>
                <div className="flex items-center">
                  <p className={`text-xl font-bold ${
                    (pet.healthStatus || pet.health) === 'Excellent' ? 'text-green-600' :
                    (pet.healthStatus || pet.health) === 'Good' ? 'text-blue-600' :
                    'text-gray-900'
                  }`}>
                    {pet.healthStatus || pet.health || 'Unknown'}
                  </p>
                  {((pet.healthStatus || pet.health) === 'Excellent' || 
                    (pet.healthStatus || pet.health) === 'Good') && (
                    <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
                  )}
                </div>
              </div>

              {/* Adoption Status */}
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 border border-yellow-200">
                <div className="flex items-center mb-2">
                  <Heart className="w-5 h-5 text-yellow-600 mr-2" />
                  <p className="text-sm font-semibold text-yellow-900 uppercase tracking-wide">Adoption Status</p>
                </div>
                <p className="text-xl font-bold text-gray-900">{pet.adoptionStatus || 'Available'}</p>
              </div>
            </div>

            {/* Description if available */}
            {pet.description && (
              <div className="mt-8 bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">About {pet.name}</h3>
                <p className="text-gray-700 leading-relaxed">{pet.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Health Records Section */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-white" />
                <h2 className="text-2xl font-bold text-white">Health Records</h2>
              </div>
              <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-semibold">
                {healthRecords.length} Records
              </span>
            </div>
          </div>

          <div className="p-8">
            {recordsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
                <p className="text-gray-600">Loading health records...</p>
              </div>
            ) : healthRecords.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-500 mb-2">No Health Records Found</h3>
                <p className="text-gray-400">This pet doesn't have any medical records yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {healthRecords.map((record, index) => (
                  <div
                    key={record._id || index}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      {/* Left Section - Main Info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              Medical Record #{index + 1}
                            </h3>
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="w-4 h-4 mr-2" />
                              Visit Date: {new Date(record.visitDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Owner Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center bg-white rounded-lg px-4 py-3">
                            <User className="w-5 h-5 text-purple-500 mr-3" />
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Owner</p>
                              <p className="font-semibold text-gray-900">{record.ownerName}</p>
                            </div>
                          </div>

                          <div className="flex items-center bg-white rounded-lg px-4 py-3">
                            <Mail className="w-5 h-5 text-pink-500 mr-3" />
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                              <p className="font-semibold text-gray-900 text-sm">{record.ownerEmail}</p>
                            </div>
                          </div>
                        </div>

                        {/* Medical Details */}
                        <div className="space-y-3">
                          {record.diagnosis && (
                            <div className="bg-white rounded-lg p-4">
                              <div className="flex items-center mb-2">
                                <FileText className="w-5 h-5 text-purple-500 mr-2" />
                                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Diagnosis</p>
                              </div>
                              <p className="text-gray-900">{record.diagnosis}</p>
                            </div>
                          )}

                          {record.treatment && (
                            <div className="bg-white rounded-lg p-4">
                              <div className="flex items-center mb-2">
                                <Activity className="w-5 h-5 text-pink-500 mr-2" />
                                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Treatment</p>
                              </div>
                              <p className="text-gray-900">{record.treatment}</p>
                            </div>
                          )}

                          {record.vaccination && (
                            <div className="bg-white rounded-lg p-4">
                              <div className="flex items-center mb-2">
                                <Syringe className="w-5 h-5 text-blue-500 mr-2" />
                                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Vaccination</p>
                              </div>
                              <p className="text-gray-900">{record.vaccination}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Section - Next Vaccination */}
                      {record.nextVaccinationDate && (
                        <div className="lg:w-64">
                          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-200">
                            <div className="flex items-center mb-2">
                              <Clock className="w-5 h-5 text-orange-500 mr-2" />
                              <p className="text-sm font-semibold text-orange-900 uppercase tracking-wide">
                                Next Vaccination
                              </p>
                            </div>
                            <p className="text-lg font-bold text-gray-900">
                              {new Date(record.nextVaccinationDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                            {new Date(record.nextVaccinationDate) < new Date() && (
                              <div className="flex items-center mt-2 text-red-600 text-sm">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                Overdue
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PetProfile;