import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Nav from '../Components/Nav/Nav';
import { PlusCircle, Heart, Users, ShoppingBag, Calendar } from 'lucide-react';

function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalPets: 0,
    adoptedPets: 0,
    totalUsers: 0,
    donations: 0
  });

  // Mock function to fetch stats - replace with actual API call
  useEffect(() => {
    // Simulate API call
    const fetchStats = async () => {
      // Replace with actual API endpoint
      const mockStats = {
        totalPets: 127,
        adoptedPets: 89,
        totalUsers: 456,
        donations: 1234
      };
      setStats(mockStats);
    };
    
    fetchStats();
  }, []);

  const statsCards = [
    {
      title: "Registered Pets",
      value: stats.totalPets,
      icon: <Heart className="w-8 h-8" />,
      color: "from-purple-500 to-purple-600",
      hoverColor: "hover:from-purple-600 hover:to-purple-700"
    },
    {
      title: "Successfully Adopted",
      value: stats.adoptedPets,
      icon: <Users className="w-8 h-8" />,
      color: "from-pink-500 to-pink-600",
      hoverColor: "hover:from-pink-600 hover:to-pink-700"
    },
    {
      title: "Active Users",
      value: stats.totalUsers,
      icon: <Users className="w-8 h-8" />,
      color: "from-purple-400 to-pink-500",
      hoverColor: "hover:from-purple-500 hover:to-pink-600"
    },
    {
      title: "Total Donations ($)",
      value: stats.donations,
      icon: <ShoppingBag className="w-8 h-8" />,
      color: "from-pink-400 to-purple-500",
      hoverColor: "hover:from-pink-500 hover:to-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <Nav collapsed={collapsed} setCollapsed={setCollapsed} />
      
      {/* Main Content */}
      <div className={` p-6`}>
        {/* Header with Add Pet Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome to Pet Care Management System</p>
          </div>
          
          {/* Add Pet Button - Top Left */}
          <Link
            to="/addpet"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add Pet
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((card, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${card.color} ${card.hoverColor} text-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-200 cursor-pointer`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">{card.title}</p>
                  <p className="text-3xl font-bold mt-2">{card.value}</p>
                </div>
                <div className="text-white/60">
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hero Section */}
          <div className="lg:col-span-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 shadow-lg">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Your Pet Can Save Lives
              </h2>
              <h3 className="text-xl font-semibold text-purple-600 mb-4">
                Register Your Pet With Us
              </h3>
              
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Join our comprehensive pet care management system where every pet matters. 
                We provide a safe haven for pets in need, connecting them with loving families 
                while ensuring they receive the best care possible.
              </p>
              
              <div className="space-y-4 text-gray-600">
                <div className="flex items-start">
                  <Heart className="w-5 h-5 text-pink-500 mt-1 mr-3 flex-shrink-0" />
                  <p>
                    <strong>Professional Healthcare:</strong> Our experienced veterinarians 
                    provide comprehensive health monitoring and medical care for all registered pets.
                  </p>
                </div>
                
                <div className="flex items-start">
                  <Users className="w-5 h-5 text-purple-500 mt-1 mr-3 flex-shrink-0" />
                  <p>
                    <strong>Adoption Services:</strong> We carefully match pets with suitable 
                    families through our thorough screening and adoption process.
                  </p>
                </div>
                
                <div className="flex items-start">
                  <ShoppingBag className="w-5 h-5 text-pink-500 mt-1 mr-3 flex-shrink-0" />
                  <p>
                    <strong>Complete Care Package:</strong> From nutrition to grooming supplies, 
                    we provide everything needed for your pet's well-being.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <Link
                  to="/pets"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg shadow-md transform hover:scale-105 transition-all duration-200"
                >
                  View All Pets
                </Link>
                
                <Link
                  to="/adoption"
                  className="inline-flex items-center px-6 py-3 bg-white border-2 border-purple-500 text-purple-600 hover:bg-purple-50 font-semibold rounded-lg shadow-md transform hover:scale-105 transition-all duration-200"
                >
                  Adopt Now
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>
            
            <div className="space-y-3">
              <Link
                to="/pets"
                className="block w-full p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg border border-purple-100 hover:border-purple-200 transition-all duration-200"
              >
                <div className="flex items-center">
                  <Heart className="w-5 h-5 text-purple-500 mr-3" />
                  <span className="font-medium text-gray-800">View All Pets</span>
                </div>
              </Link>
              
              <Link
                to="/displayUser"
                className="block w-full p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg border border-purple-100 hover:border-purple-200 transition-all duration-200"
              >
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-pink-500 mr-3" />
                  <span className="font-medium text-gray-800">Manage Users</span>
                </div>
              </Link>
              
              <Link
                to="/donations"
                className="block w-full p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg border border-purple-100 hover:border-purple-200 transition-all duration-200"
              >
                <div className="flex items-center">
                  <Heart className="w-5 h-5 text-purple-500 mr-3" />
                  <span className="font-medium text-gray-800">Donations</span>
                </div>
              </Link>
              
              <Link
                to="/shop"
                className="block w-full p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg border border-purple-100 hover:border-purple-200 transition-all duration-200"
              >
                <div className="flex items-center">
                  <ShoppingBag className="w-5 h-5 text-pink-500 mr-3" />
                  <span className="font-medium text-gray-800">Pet Shop</span>
                </div>
              </Link>
            </div>

            {/* Recent Activity */}
            <div className="mt-8">
              <h4 className="font-semibold text-gray-800 mb-4">Recent Activity</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>New pet "Buddy" registered</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span>Adoption request approved</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  <span>Health checkup completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;