import React, { useState, useEffect } from 'react';
import { Heart, Users, DollarSign, Calendar, TrendingUp, Handshake } from 'lucide-react';
import Nav from '../Components/Nav/Nav';

function UserDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalPets: 0,
    adoptedPets: 0,
    totalUsers: 0,
    totalDonations: 0,
    totalSponsors: 0,
    activeSponsorAmount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all required data
      const [petsRes, donationsRes, sponsorsRes] = await Promise.all([
        fetch('http://localhost:5000/pets').then(r => r.json()),
        fetch('http://localhost:5000/donations').then(r => r.json()),
        fetch('http://localhost:5000/sponsors').then(r => r.json())
      ]);

      const pets = petsRes.pets || petsRes || [];
      const donations = donationsRes.donations || donationsRes || [];
      const allSponsors = sponsorsRes.sponsors || sponsorsRes || [];

      // Calculate total donation amount
      const totalDonationAmount = donations.reduce((sum, donation) => {
        return sum + (Number(donation.Amount) || 0);
      }, 0);

      // Calculate active sponsor amount
      const activeSponsors = allSponsors.filter(s => s.status === 'active');
      const activeSponsorAmount = activeSponsors.reduce((sum, sponsor) => {
        return sum + (Number(sponsor.sponsorAmount) || 0);
      }, 0);

      // Count adopted pets
      const adoptedPets = pets.filter(pet => 
        pet.adoptionStatus === 'Adopted' || pet.status === 'Adopted'
      );

      setStats({
        totalPets: pets.length,
        adoptedPets: adoptedPets.length,
        totalUsers: 0, // You can fetch users count if needed
        totalDonations: totalDonationAmount,
        totalSponsors: allSponsors.length,
        activeSponsorAmount: activeSponsorAmount
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

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
      title: "Total Donations",
      value: `Rs. ${stats.totalDonations.toLocaleString()}`,
      icon: <DollarSign className="w-8 h-8" />,
      color: "from-green-500 to-emerald-600",
      hoverColor: "hover:from-green-600 hover:to-emerald-700"
    },
    {
      title: "Active Sponsors",
      value: `Rs. ${stats.activeSponsorAmount.toLocaleString()}`,
      icon: <Handshake className="w-8 h-8" />,
      color: "from-blue-500 to-indigo-600",
      hoverColor: "hover:from-blue-600 hover:to-indigo-700"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex">
        <Nav collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={`flex-1 transition-all duration-300 ${
          collapsed ? 'ml-16' : 'ml-64'
        } p-6`}>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-purple-600 font-medium">Loading Dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      <Nav collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className={`flex-1 transition-all duration-300 ${
        collapsed ? 'ml-16' : 'ml-64'
      } p-6`}>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome to PawPal Pet Care Management System</p>
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
                  <DollarSign className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <p>
                    <strong>Support Through Donations:</strong> Your generous donations help us 
                    provide food, medical care, and shelter for pets in need.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg shadow-md transform hover:scale-105 transition-all duration-200">
                  View All Pets
                </button>
                
                <button className="inline-flex items-center px-6 py-3 bg-white border-2 border-purple-500 text-purple-600 hover:bg-purple-50 font-semibold rounded-lg shadow-md transform hover:scale-105 transition-all duration-200">
                  Adopt Now
                </button>
              </div>
            </div>
          </div>

          {/* Impact Summary Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Community Impact</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg mr-4">
                    <Heart className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pets Rescued</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalPets}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg mr-4">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Donations Received</p>
                    <p className="text-xl font-bold text-gray-800">Rs. {stats.totalDonations.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4">
                    <Handshake className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sponsor Support</p>
                    <p className="text-xl font-bold text-gray-800">Rs. {stats.activeSponsorAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg">
                <div className="flex items-center">
                  <div className="p-3 bg-pink-100 rounded-lg mr-4">
                    <Users className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Happy Adoptions</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.adoptedPets}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
              <p className="text-sm font-medium mb-2">Join Our Mission</p>
              <p className="text-xs opacity-90">Together we've raised Rs. {(stats.totalDonations + stats.activeSponsorAmount).toLocaleString()} to care for pets in need!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;