import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Users, DollarSign, Calendar, TrendingUp, Handshake, RefreshCw, AlertCircle } from 'lucide-react';
import Nav from '../Components/Nav/Nav';

function UserDashboard() {

  const [collapsed, setCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalPets: 0,
    adoptedPets: 0,
    totalUsers: 0,
    totalDonations: 0,
    totalSponsors: 0,
    activeSponsorAmount: 0,
    activeSponsors: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // API Base URL - change this to your backend URL
  const API_BASE_URL = 'http://localhost:5000';

  const fetchDashboardStats = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch all data concurrently
      const [petsResponse, donationsResponse, sponsorsResponse, usersResponse] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/pets`, {
          headers: { 'Content-Type': 'application/json' }
        }),
        fetch(`${API_BASE_URL}/donations`, {
          headers: { 'Content-Type': 'application/json' }
        }),
        fetch(`${API_BASE_URL}/sponsors`, {
          headers: { 'Content-Type': 'application/json' }
        }),
        fetch(`${API_BASE_URL}/users`, {
          headers: { 'Content-Type': 'application/json' }
        })
      ]);

      // Parse responses
      let pets = [];
      let donations = [];
      let sponsors = [];
      let users = [];

      if (petsResponse.status === 'fulfilled' && petsResponse.value.ok) {
        const petsData = await petsResponse.value.json();
        pets = petsData.pets || petsData || [];
      }

      if (donationsResponse.status === 'fulfilled' && donationsResponse.value.ok) {
        const donationsData = await donationsResponse.value.json();
        donations = donationsData.donations || donationsData || [];
      }

      if (sponsorsResponse.status === 'fulfilled' && sponsorsResponse.value.ok) {
        const sponsorsData = await sponsorsResponse.value.json();
        sponsors = sponsorsData.sponsors || sponsorsData || [];
      }

      if (usersResponse.status === 'fulfilled' && usersResponse.value.ok) {
        const usersData = await usersResponse.value.json();
        users = usersData.users || usersData || [];
      }

      // Calculate statistics
      const totalDonationAmount = donations.reduce((sum, donation) => {
        const amount = parseFloat(donation.Amount || donation.amount || 0);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

      const activeSponsors = sponsors.filter(sponsor => 
        sponsor.status === 'active' || sponsor.Status === 'active'
      );

      const activeSponsorAmount = activeSponsors.reduce((sum, sponsor) => {
        const amount = parseFloat(sponsor.sponsorAmount || sponsor.amount || 0);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

      const adoptedPets = pets.filter(pet => 
        pet.adoptionStatus === 'Adopted' || 
        pet.status === 'Adopted' ||
        pet.AdoptionStatus === 'Adopted' ||
        pet.Status === 'Adopted'
      );

      // Update stats
      setStats({
        totalPets: pets.length,
        adoptedPets: adoptedPets.length,
        totalUsers: users.length,
        totalDonations: totalDonationAmount,
        totalSponsors: sponsors.length,
        activeSponsorAmount: activeSponsorAmount,
        activeSponsors: activeSponsors.length
      });

      setLastUpdated(new Date());
      
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard data. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [API_BASE_URL]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardStats();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchDashboardStats]);

  const handleManualRefresh = () => {
    fetchDashboardStats(true);
  };

  const statsCards = [
    {
      title: "Registered Pets",
      value: stats.totalPets,
      icon: <Heart className="w-8 h-8" />,
      color: "from-purple-500 to-purple-600",
      hoverColor: "hover:from-purple-600 hover:to-purple-700",
      trend: "+12% from last month"
    },
    {
      title: "Successfully Adopted",
      value: stats.adoptedPets,
      icon: <Users className="w-8 h-8" />,
      color: "from-pink-500 to-pink-600",
      hoverColor: "hover:from-pink-600 hover:to-pink-700",
      trend: `${stats.totalPets > 0 ? Math.round((stats.adoptedPets / stats.totalPets) * 100) : 0}% adoption rate`
    },
    {
      title: "Registered Users",
      value: stats.totalUsers,
      icon: <Users className="w-8 h-8" />,
      color: "from-indigo-500 to-indigo-600",
      hoverColor: "hover:from-indigo-600 hover:to-indigo-700",
      trend: "Active community members"
    },
    {
      title: "Total Sponsors",
      value: `${stats.totalSponsors} (${stats.activeSponsors} active)`,
      icon: <Handshake className="w-8 h-8" />,
      color: "from-orange-500 to-orange-600",
      hoverColor: "hover:from-orange-600 hover:to-orange-700",
      trend: `${stats.activeSponsors} currently supporting`
    },
    {
      title: "Total Donations",
      value: `Rs. ${stats.totalDonations.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <DollarSign className="w-8 h-8" />,
      color: "from-green-500 to-emerald-600",
      hoverColor: "hover:from-green-600 hover:to-emerald-700",
      trend: "One-time contributions"
    },
    {
      title: "Active Sponsor Support",
      value: `Rs. ${stats.activeSponsorAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <Handshake className="w-8 h-8" />,
      color: "from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-600 hover:to-blue-700",
      trend: "Monthly recurring support"
    }
  ];

  if (loading && !lastUpdated) {
    return (
       <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <Nav collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content - Adjusts based on sidebar state */}
      <div className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'} p-6`}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 mx-auto mb-4"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600 mx-auto mb-4 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="text-purple-600 font-semibold text-lg">Loading Dashboard...</p>
          <p className="text-gray-500 text-sm mt-2">Fetching real-time data</p>
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center">
              <Heart className="w-10 h-10 text-purple-600 mr-3" />
              Dashboard
            </h1>
            <p className="text-gray-600">Welcome to PawPal Pet Care Management System</p>
          </div>
          
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statsCards.map((card, index) => (
            <div
              key={index}
              className={`relative bg-gradient-to-br ${card.color} ${card.hoverColor} text-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden group`}
            >
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-white/80 text-sm font-medium mb-1">{card.title}</p>
                    <p className="text-3xl font-bold">{card.value}</p>
                  </div>
                  <div className="text-white/60 group-hover:text-white/80 transition-colors">
                    {card.icon}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-white/70 text-xs">
                  <TrendingUp className="w-3 h-3" />
                  <span>{card.trend}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
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
                <div className="flex items-start p-4 bg-pink-50 rounded-lg">
                  <Heart className="w-5 h-5 text-pink-500 mt-1 mr-3 flex-shrink-0" />
                  <p>
                    <strong className="text-gray-800">Professional Healthcare:</strong> Our experienced veterinarians 
                    provide comprehensive health monitoring and medical care for all registered pets.
                  </p>
                </div>
                
                <div className="flex items-start p-4 bg-purple-50 rounded-lg">
                  <Users className="w-5 h-5 text-purple-500 mt-1 mr-3 flex-shrink-0" />
                  <p>
                    <strong className="text-gray-800">Adoption Services:</strong> We carefully match pets with suitable 
                    families through our thorough screening and adoption process.
                  </p>
                </div>
                
                <div className="flex items-start p-4 bg-green-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <p>
                    <strong className="text-gray-800">Support Through Donations:</strong> Your generous donations help us 
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
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Community Impact</h3>
            
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg transform hover:scale-105 transition-transform">
                <div className="p-3 bg-purple-100 rounded-lg mr-4">
                  <Heart className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pets Rescued</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalPets}</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg transform hover:scale-105 transition-transform">
                <div className="p-3 bg-green-100 rounded-lg mr-4">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Donations Received</p>
                  <p className="text-lg font-bold text-gray-800">Rs. {stats.totalDonations.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg transform hover:scale-105 transition-transform">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <Handshake className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sponsor Support</p>
                  <p className="text-lg font-bold text-gray-800">Rs. {stats.activeSponsorAmount.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg transform hover:scale-105 transition-transform">
                <div className="p-3 bg-pink-100 rounded-lg mr-4">
                  <Users className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Happy Adoptions</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.adoptedPets}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold">Total Community Support</p>
                <Calendar className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold mb-1">
                Rs. {(stats.totalDonations + stats.activeSponsorAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs opacity-90">Together we're making a difference in pets' lives!</p>
            </div>

            {/* Live indicator */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live data • Auto-refreshing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
    </div>
  );
}

export default UserDashboard;