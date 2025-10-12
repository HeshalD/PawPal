import React, { useEffect, useState } from "react";
import axios from "axios";
import Nav from "../Components/Nav/Nav";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Edit, Trash2, Eye, Calendar, Award } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  // Categorization helpers (component scope)
  const getHealthValue = (pet) => (pet.healthStatus || pet.health || '').toString().trim();
  const getHealthCategory = (pet) => {
    const v = getHealthValue(pet).toLowerCase();
    if (["healthy", "excellent", "very good"].includes(v)) return "Healthy";
    if (["normal", "good", "average"].includes(v)) return "Normal";
    if (["weak", "poor", "critical"].includes(v)) return "Weak";
    return "Normal";
  };

  const healthyPets = pets.filter(p => getHealthCategory(p) === 'Healthy');
  const normalPets = pets.filter(p => getHealthCategory(p) === 'Normal');
  const weakPets = pets.filter(p => getHealthCategory(p) === 'Weak');

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

  // Download PDF report of all pets
  const downloadReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Title
    doc.setFontSize(20);
    doc.setTextColor(147, 51, 234);
    doc.text('PawPal Pets Report', pageWidth / 2, 20, { align: 'center' });

    // Meta
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 35);
    doc.text(`Total Pets: ${pets.length}`, 14, 40);

    // Summary small table
    const healthyCount = pets.filter(p => (p.healthStatus || p.health) === 'Excellent').length;
    const goodCount = pets.filter(p => (p.healthStatus || p.health) === 'Good' || (p.healthStatus || p.health) === 'Very Good').length;
    const unknownCount = pets.length - healthyCount - goodCount;

    autoTable(doc, {
      startY: 45,
      head: [['Metric', 'Value']],
      body: [
        ['Total Pets', String(pets.length)],
        ['Healthy (Excellent)', String(healthyCount)],
        ['Good/Very Good', String(goodCount)],
        ['Unknown/Other', String(unknownCount)],
      ],
      theme: 'grid',
      headStyles: { fillColor: [147, 51, 234] },
      margin: { left: 14, right: 14 }
    });

    const startY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : 60;

    // Main pets table
    const rows = pets.map(p => [
      p.name || '-',
      p.breed || '-',
      (Number(p.age) || p.age === 0) ? `${p.age}` : '-',
      (p.healthStatus || p.health || 'Unknown'),
      p._id || '-'
    ]);

    autoTable(doc, {
      startY,
      head: [['Name', 'Breed', 'Age', 'Health', 'ID']],
      body: rows,
      theme: 'striped',
      headStyles: { fillColor: [236, 72, 153] },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 }
    });

    // Footer page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    doc.save(`pets-report-${new Date().toISOString().split('T')[0]}.pdf`);
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

      {/* Main Content - Adjusts based on sidebar state */}
      <div className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'} p-6`}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Pet Management</h1>
          <p className="text-gray-600">Manage and view all registered pets in the system</p>
        </div>

        {/* Stats Bar */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-8 border border-purple-100">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{pets.length}</p>
                <p className="text-sm text-gray-600">Total Pets</p>
              </div>
              <div className="h-12 w-px bg-gray-300 hidden sm:block"></div>
              <div className="text-center">
                <p className="text-3xl font-bold text-pink-600">
                  {pets.filter(pet => pet.healthStatus === 'Excellent' || pet.health === 'Excellent').length}
                </p>
                <p className="text-sm text-gray-600">Healthy Pets</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={downloadReport}
                className="inline-flex items-center px-6 py-3 bg-white border-2 border-purple-500 text-purple-600 hover:bg-purple-50 font-semibold rounded-lg shadow-sm transition-all duration-200 whitespace-nowrap"
              >
                📄 Download Report
              </button>
              <Link
                to="/addpet"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 whitespace-nowrap"
              >
                <Heart className="w-5 h-5 mr-2" />
                Add New Pet
              </Link>
            </div>
          </div>
        </div>

        {/* Categorized Pet Sections */}
        {[{ title: 'Healthy', color: 'from-green-50 to-emerald-50', list: healthyPets },
          { title: 'Normal', color: 'from-blue-50 to-indigo-50', list: normalPets },
          { title: 'Weak', color: 'from-red-50 to-rose-50', list: weakPets }].map(section => (
          <div key={section.title} className="mb-10">
            <div className={`rounded-xl border p-4 mb-4 bg-gradient-to-r ${section.color} border-gray-100 flex items-center justify-between`}>
              <h2 className="text-xl font-bold text-gray-800">{section.title} Pets</h2>
              <span className="text-sm text-gray-600">{section.list.length} pets</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {section.list.map((pet) => (
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
                  <Link to={`/UserPetProfile/${pet._id}`}>
                  <button
                    className="flex items-center px-3 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all duration-200"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">View</span>
                  </button>
                  </Link>

                  <div className="flex space-x-2">
                    <Link to={`/updatepet/${pet._id}`}>
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
            {section.list.length === 0 && (
              <div className="bg-white rounded-xl shadow border border-gray-100 p-8 text-center text-gray-500">No {section.title.toLowerCase()} pets</div>
            )}
          </div>
        ))}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Showing {pets.length} pets • Click on any pet card to view detailed profile</p>
        </div>
      </div>
    </div>
  );
}

export default DisplayPet;