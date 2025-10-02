import React, { useState, useEffect } from 'react';
import AdminNav from '../Components/Nav/NavAdmin';
import { 
  Users, Heart, DollarSign, Package, UserCheck, ShoppingCart, 
  Bell, RefreshCw, AlertCircle, Home, Handshake, Clock, 
  ArrowUpRight, ArrowDownRight, Download, Activity
} from 'lucide-react';

function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalPets: 0,
      totalDonations: 0,
      activeUsers: 0,
      totalAdoptions: 0,
      totalSponsors: 0,
      activeSponsorAmount: 0,
      pendingSponsorAmount: 0
    },
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:5000';

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const responses = await Promise.allSettled([
        fetch(`${API_BASE_URL}/pets`).then(r => r.json()),
        fetch(`${API_BASE_URL}/users`).then(r => r.json()), 
        fetch(`${API_BASE_URL}/donations`).then(r => r.json()),
        fetch(`${API_BASE_URL}/sponsors`).then(r => r.json())
      ]);

      const [petsRes, usersRes, donationsRes, sponsorsRes] = responses;

      const pets = petsRes.status === 'fulfilled' ? (petsRes.value.pets || petsRes.value || []) : [];
      const users = usersRes.status === 'fulfilled' ? (usersRes.value.users || usersRes.value || []) : [];
      const donations = donationsRes.status === 'fulfilled' ? (donationsRes.value.donations || donationsRes.value || []) : [];
      const allSponsors = sponsorsRes.status === 'fulfilled' ? (sponsorsRes.value.sponsors || sponsorsRes.value || []) : [];

      // Calculate total donation amount (matching DonationManager logic)
      const totalDonationAmount = donations.reduce((sum, donation) => {
        return sum + (Number(donation.Amount) || 0);
      }, 0);

      // Calculate sponsor amounts (matching ManagerDashboard logic)
      const activeSponsors = allSponsors.filter(s => s.status === 'active');
      const pendingSponsors = allSponsors.filter(s => s.status === 'pending');
      
      const activeSponsorAmount = activeSponsors.reduce((sum, sponsor) => {
        const amount = Number(sponsor.sponsorAmount) || 0;
        return sum + amount;
      }, 0);
      
      const pendingSponsorAmount = pendingSponsors.reduce((sum, sponsor) => {
        const amount = Number(sponsor.sponsorAmount) || 0;
        return sum + amount;
      }, 0);

      // Count active users
      const activeUsers = users.filter(user => {
        const lastActive = new Date(user.lastActive || user.createdAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return lastActive > thirtyDaysAgo;
      });

      // Count adopted pets
      const adoptedPets = pets.filter(pet => 
        pet.adoptionStatus === 'Adopted' || pet.status === 'Adopted'
      );

      // Generate recent activities
      const recentActivities = generateRecentActivities(pets, donations, allSponsors);

      setDashboardData({
        stats: {
          totalPets: pets.length,
          totalDonations: totalDonationAmount,
          activeUsers: activeUsers.length,
          totalAdoptions: adoptedPets.length,
          totalSponsors: allSponsors.length,
          activeSponsorAmount: activeSponsorAmount,
          pendingSponsorAmount: pendingSponsorAmount
        },
        recentActivities
      });

      setLastUpdated(new Date());

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const generateRecentActivities = (pets, donations, sponsors) => {
    const activities = [];

    // Recent pets (last 3)
    const recentPets = pets
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);

    recentPets.forEach(pet => {
      activities.push({
        id: `pet_${pet._id}`,
        action: 'New pet registered',
        details: `${pet.breed || pet.type} - ${pet.name}`,
        time: formatTimeAgo(pet.createdAt),
        type: 'pet',
        icon: Heart,
        timestamp: new Date(pet.createdAt)
      });
    });

    // Recent donations (last 3)
    const recentDonations = donations
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);

    recentDonations.forEach(donation => {
      activities.push({
        id: `donation_${donation._id}`,
        action: 'Donation received',
        details: `Rs. ${donation.Amount} from ${donation.fullname || donation.Email || 'Anonymous'}`,
        time: formatTimeAgo(donation.createdAt),
        type: 'donation',
        icon: DollarSign,
        timestamp: new Date(donation.createdAt)
      });
    });

    // Recent sponsors (last 3)
    const recentSponsors = sponsors
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);

    recentSponsors.forEach(sponsor => {
      activities.push({
        id: `sponsor_${sponsor._id}`,
        action: 'New sponsor',
        details: `${sponsor.sponsorName} - Rs. ${sponsor.sponsorAmount}`,
        time: formatTimeAgo(sponsor.createdAt),
        type: 'sponsor',
        icon: Handshake,
        timestamp: new Date(sponsor.createdAt)
      });
    });

    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 8);
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading && !dashboardData.stats.totalPets) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Dashboard</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={fetchDashboardData}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Pets',
      value: dashboardData.stats.totalPets.toLocaleString(),
      icon: Heart,
      color: 'from-pink-500 to-rose-500'
    },
    {
      title: 'Total Donations',
      value: `Rs. ${dashboardData.stats.totalDonations.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Active Users',
      value: dashboardData.stats.activeUsers.toLocaleString(),
      icon: Users,
      color: 'from-blue-500 to-indigo-500'
    },
    {
      title: 'Total Adoptions',
      value: dashboardData.stats.totalAdoptions.toLocaleString(),
      icon: UserCheck,
      color: 'from-purple-500 to-violet-500'
    },
    {
      title: 'Total Sponsors',
      value: dashboardData.stats.totalSponsors.toLocaleString(),
      icon: Handshake,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      title: 'Active Sponsor Amount',
      value: `Rs. ${dashboardData.stats.activeSponsorAmount.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-cyan-500 to-blue-500'
    },
    {
      title: 'Pending Sponsor Amount',
      value: `Rs. ${dashboardData.stats.pendingSponsorAmount.toLocaleString()}`,
      icon: Clock,
      color: 'from-orange-500 to-amber-500'
    },
    {
      title: 'Total Revenue',
      value: `Rs. ${(dashboardData.stats.totalDonations + dashboardData.stats.activeSponsorAmount).toLocaleString()}`,
      icon: Package,
      color: 'from-teal-500 to-cyan-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'} p-6`}>
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-6 mb-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Real-time data • Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={fetchDashboardData}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              <button className="relative p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg">
                <Bell className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">LIVE</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {dashboardData.recentActivities.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No recent activities</p>
              </div>
            ) : (
              dashboardData.recentActivities.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'pet' ? 'bg-pink-100 text-pink-600' :
                      activity.type === 'donation' ? 'bg-green-100 text-green-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600 truncate">{activity.details}</p>
                      <div className="flex items-center mt-1">
                        <Clock className="w-3 h-3 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;