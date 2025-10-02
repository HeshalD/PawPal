import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Nav from '../Components/Nav/NavAdmin';
import { 
  Users, 
  Heart, 
  DollarSign, 
  Package,
  UserCheck,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertCircle,
  Home,
  Handshake,
  RefreshCw,
  Download,
  Activity
} from 'lucide-react';

function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    recentActivities: [],
    previousStats: null
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoints = [
        { name: 'pets', url: `${API_BASE_URL}/pets` },
        { name: 'users', url: `${API_BASE_URL}/users` },
        { name: 'donations', url: `${API_BASE_URL}/donations` },
        { name: 'adoptions', url: `${API_BASE_URL}/adoptions` },
        { name: 'sponsors', url: `${API_BASE_URL}/sponsors` },
        { name: 'fosters', url: `${API_BASE_URL}/fosters` },
        { name: 'orders', url: `${API_BASE_URL}/orders` },
        { name: 'inventory', url: `${API_BASE_URL}/inventories` }
      ];

      const responses = await Promise.allSettled(
        endpoints.map(endpoint => 
          axios.get(endpoint.url, {
            timeout: 10000,
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          })
        )
      );

      const dataMap = {};
      responses.forEach((response, index) => {
        const endpointName = endpoints[index].name;
        if (response.status === 'fulfilled') {
          const data = response.value.data;
          dataMap[endpointName] = data[endpointName] || data.data || data || [];
        } else {
          console.error(`Failed to fetch ${endpointName}:`, response.reason);
          dataMap[endpointName] = [];
        }
      });

      const pets = Array.isArray(dataMap.pets) ? dataMap.pets : [];
      const users = Array.isArray(dataMap.users) ? dataMap.users : [];
      const donations = Array.isArray(dataMap.donations) ? dataMap.donations : [];
      const adoptions = Array.isArray(dataMap.adoptions) ? dataMap.adoptions : [];
      const sponsors = Array.isArray(dataMap.sponsors) ? dataMap.sponsors : [];
      const fosters = Array.isArray(dataMap.fosters) ? dataMap.fosters : [];
      const orders = Array.isArray(dataMap.orders) ? dataMap.orders : [];
      const inventory = Array.isArray(dataMap.inventory) ? dataMap.inventory : [];

      // Calculate pets stats
      const availablePets = pets.filter(p => p.status === 'available' || p.adoptionStatus === 'available').length;
      const adoptedPets = pets.filter(p => p.status === 'adopted' || p.adoptionStatus === 'adopted').length;

      // Calculate donation stats
      const totalDonationAmount = donations.reduce((sum, d) => sum + (parseFloat(d.Amount || d.amount || 0)), 0);
      const completedDonations = donations.filter(d => d.status === 'completed');
      const pendingDonations = donations.filter(d => d.status === 'pending');
      const completedAmount = completedDonations.reduce((sum, d) => sum + (parseFloat(d.Amount || d.amount || 0)), 0);
      const pendingAmount = pendingDonations.reduce((sum, d) => sum + (parseFloat(d.Amount || d.amount || 0)), 0);

      // Calculate adoption stats
      const approvedAdoptions = adoptions.filter(a => a.status === 'approved' || a.approved === true).length;
      const pendingAdoptionReq = adoptions.filter(a => a.status === 'pending').length;

      // Calculate sponsor stats
      const activeSponsors = sponsors.filter(s => s.status === 'active' || s.status === 'approved').length;
      const pendingSponsors = sponsors.filter(s => s.status === 'pending').length;

      // Calculate foster stats
      const activeFosters = fosters.filter(f => f.status === 'active' || f.status === 'approved').length;
      const pendingFosters = fosters.filter(f => f.status === 'pending').length;

      // Calculate order stats
      const totalOrderAmount = orders.reduce((sum, o) => sum + (parseFloat(o.total || o.amount || 0)), 0);
      const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'delivered').length;
      const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;

      // Calculate inventory stats
      const lowStockItems = inventory.filter(i => (i.quantity || i.stock || 0) < 10 && (i.quantity || i.stock || 0) > 0).length;
      const outOfStockItems = inventory.filter(i => (i.quantity || i.stock || 0) === 0).length;
      const inStockItems = inventory.filter(i => (i.quantity || i.stock || 0) >= 10).length;

      // Calculate user stats
      const activeUsers = users.filter(u => u.status === 'active' || u.isActive === true).length;
      const newUsersThisMonth = users.filter(u => {
        const userDate = new Date(u.createdAt || u.registrationDate);
        const now = new Date();
        return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
      }).length;

      const previousStats = dashboardData.stats.totalPets > 0 ? { ...dashboardData.stats } : null;

      const recentActivities = generateRecentActivities(pets, donations, adoptions, users, orders);

      setDashboardData({
        stats: {
          totalPets: pets.length,
          availablePets,
          adoptedPets,
          totalDonations: totalDonationAmount,
          completedDonationCount: completedDonations.length,
          pendingDonationCount: pendingDonations.length,
          completedAmount,
          pendingAmount,
          totalAdoptions: approvedAdoptions,
          pendingAdoptionReq,
          totalSponsors: sponsors.length,
          activeSponsors,
          pendingSponsors,
          totalFosters: fosters.length,
          activeFosters,
          pendingFosters,
          shopOrders: orders.length,
          completedOrders,
          pendingOrders,
          totalOrderAmount,
          inventoryItems: inventory.length,
          lowStockItems,
          outOfStockItems,
          inStockItems,
          totalUsers: users.length,
          activeUsers,
          newUsersThisMonth
        },
        recentActivities,
        previousStats
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const generateRecentActivities = (pets, donations, adoptions, users, orders) => {
    const activities = [];

    [...pets].sort((a, b) => new Date(b.createdAt || b.dateAdded) - new Date(a.createdAt || a.dateAdded))
      .slice(0, 3).forEach(pet => {
        activities.push({
          id: `pet_${pet._id || pet.id}`,
          action: 'New pet registered',
          details: `${pet.breed || pet.species || 'Pet'} - ${pet.name || 'Unknown'}`,
          time: formatTimeAgo(pet.createdAt || pet.dateAdded),
          type: 'pet',
          icon: Heart,
          timestamp: new Date(pet.createdAt || pet.dateAdded)
        });
      });

    [...donations].sort((a, b) => new Date(b.createdAt || b.donationDate) - new Date(a.createdAt || a.donationDate))
      .slice(0, 3).forEach(donation => {
        const donorName = donation.fullname || donation.donorName || donation.Email?.split('@')[0] || 'Anonymous';
        const amount = parseFloat(donation.Amount || donation.amount || 0);
        activities.push({
          id: `donation_${donation._id || donation.id}`,
          action: 'Donation received',
          details: `Rs. ${amount.toFixed(2)} from ${donorName}`,
          time: formatTimeAgo(donation.createdAt || donation.donationDate),
          type: 'donation',
          icon: DollarSign,
          timestamp: new Date(donation.createdAt || donation.donationDate)
        });
      });

    [...adoptions].sort((a, b) => new Date(b.createdAt || b.adoptionDate) - new Date(a.createdAt || a.adoptionDate))
      .slice(0, 2).forEach(adoption => {
        const pet = pets.find(p => (p._id || p.id) === (adoption.petId || adoption.pet_id));
        const adopterName = adoption.adopterName || adoption.userName || 'Someone';
        activities.push({
          id: `adoption_${adoption._id || adoption.id}`,
          action: 'Pet adopted',
          details: `${pet?.name || 'Pet'} adopted by ${adopterName}`,
          time: formatTimeAgo(adoption.createdAt || adoption.adoptionDate),
          type: 'adoption',
          icon: UserCheck,
          timestamp: new Date(adoption.createdAt || adoption.adoptionDate)
        });
      });

    [...orders].sort((a, b) => new Date(b.createdAt || b.orderDate) - new Date(a.createdAt || a.orderDate))
      .slice(0, 2).forEach(order => {
        const orderId = (order._id || order.id || '').toString().slice(-6);
        activities.push({
          id: `order_${order._id || order.id}`,
          action: 'Shop order',
          details: `Order #${orderId} - Rs. ${parseFloat(order.total || 0).toFixed(2)}`,
          time: formatTimeAgo(order.createdAt || order.orderDate),
          type: 'shop',
          icon: ShoppingCart,
          timestamp: new Date(order.createdAt || order.orderDate)
        });
      });

    return activities
      .filter(a => a.timestamp && !isNaN(a.timestamp.getTime()))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Unknown';
    const diffInSeconds = Math.floor((new Date() - date) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return { value: '0.0', type: 'neutral' };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      type: change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'
    };
  };

  useEffect(() => {
    fetchDashboardData();
    if (autoRefresh) {
      const interval = setInterval(fetchDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({
      exportDate: new Date().toISOString(),
      stats: dashboardData.stats,
      recentActivities: dashboardData.recentActivities
    }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading && !dashboardData.stats.totalPets) {
    return (
      <div className="min-h-screen bg-white flex">
        <Nav collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={`flex-1 transition-all duration-300 ${
          collapsed ? 'ml-16' : 'ml-64'
        } p-6`}>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
        </div>
      </div>
    );
  }

  if (error && !dashboardData.stats.totalPets) {
    return (
      <div className="min-h-screen bg-white flex">
        <Nav collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={`flex-1 transition-all duration-300 ${
          collapsed ? 'ml-16' : 'ml-64'
        } p-6`}>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={fetchDashboardData} className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
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
      value: dashboardData.stats.totalPets || 0,
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
      details: [
        { label: 'Available', value: dashboardData.stats.availablePets || 0, color: 'text-green-600' },
        { label: 'Adopted', value: dashboardData.stats.adoptedPets || 0, color: 'text-blue-600' }
      ]
    },
    {
      title: 'Total Donations',
      value: `Rs. ${(dashboardData.stats.totalDonations || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
      details: [
        { label: 'Completed', value: dashboardData.stats.completedDonationCount || 0, amount: dashboardData.stats.completedAmount || 0, color: 'text-green-600' },
        { label: 'Pending', value: dashboardData.stats.pendingDonationCount || 0, amount: dashboardData.stats.pendingAmount || 0, color: 'text-yellow-600' }
      ]
    },
    {
      title: 'Adoptions',
      value: dashboardData.stats.totalAdoptions || 0,
      icon: UserCheck,
      color: 'from-purple-500 to-violet-500',
      details: [
        { label: 'Approved', value: dashboardData.stats.totalAdoptions || 0, color: 'text-green-600' },
        { label: 'Pending', value: dashboardData.stats.pendingAdoptionReq || 0, color: 'text-yellow-600' }
      ]
    },
    {
      title: 'Sponsors',
      value: dashboardData.stats.totalSponsors || 0,
      icon: Handshake,
      color: 'from-yellow-500 to-orange-500',
      details: [
        { label: 'Active', value: dashboardData.stats.activeSponsors || 0, color: 'text-green-600' },
        { label: 'Pending', value: dashboardData.stats.pendingSponsors || 0, color: 'text-yellow-600' }
      ]
    },
    {
      title: 'Foster Families',
      value: dashboardData.stats.totalFosters || 0,
      icon: Home,
      color: 'from-cyan-500 to-blue-500',
      details: [
        { label: 'Active', value: dashboardData.stats.activeFosters || 0, color: 'text-green-600' },
        { label: 'Pending', value: dashboardData.stats.pendingFosters || 0, color: 'text-yellow-600' }
      ]
    },
    {
      title: 'Shop Orders',
      value: dashboardData.stats.shopOrders || 0,
      icon: ShoppingCart,
      color: 'from-orange-500 to-amber-500',
      details: [
        { label: 'Completed', value: dashboardData.stats.completedOrders || 0, color: 'text-green-600' },
        { label: 'Pending', value: dashboardData.stats.pendingOrders || 0, color: 'text-yellow-600' },
        { label: 'Total Revenue', value: `Rs. ${(dashboardData.stats.totalOrderAmount || 0).toLocaleString()}`, color: 'text-blue-600', fullWidth: true }
      ]
    },
    {
      title: 'Inventory',
      value: dashboardData.stats.inventoryItems || 0,
      icon: Package,
      color: 'from-teal-500 to-cyan-500',
      details: [
        { label: 'In Stock', value: dashboardData.stats.inStockItems || 0, color: 'text-green-600' },
        { label: 'Low Stock', value: dashboardData.stats.lowStockItems || 0, color: 'text-orange-600' },
        { label: 'Out of Stock', value: dashboardData.stats.outOfStockItems || 0, color: 'text-red-600' }
      ]
    },
    {
      title: 'Users',
      value: dashboardData.stats.totalUsers || 0,
      icon: Users,
      color: 'from-blue-500 to-indigo-500',
      details: [
        { label: 'Active', value: dashboardData.stats.activeUsers || 0, color: 'text-green-600' },
        { label: 'New This Month', value: dashboardData.stats.newUsersThisMonth || 0, color: 'text-blue-600' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white flex">
        <Nav collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={`flex-1 transition-all duration-300 ${
          collapsed ? 'ml-16' : 'ml-64'
        } p-6`}>
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white shadow-sm border border-gray-200 p-6 mb-6 rounded-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Last updated: {lastUpdated.toLocaleTimeString()}</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-2 rounded-lg ${autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
            >
              Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
            </button>
            <button 
              onClick={fetchDashboardData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          const change = calculateChange(
            typeof stat.value === 'string' ? dashboardData.stats.totalDonations : stat.value,
            dashboardData.previousStats?.[Object.keys(dashboardData.stats)[index]] || 0
          );
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
              {loading && <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200"><div className="h-1 bg-purple-600 animate-pulse"></div></div>}
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-gray-600 text-sm font-medium mb-2">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
              </div>

              {stat.details && (
                <div className={`grid ${stat.details.length === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-2 mt-3`}>
                  {stat.details.map((detail, idx) => (
                    <div key={idx} className={`bg-gray-50 rounded-lg p-2 ${detail.fullWidth ? 'col-span-2' : ''}`}>
                      <p className="text-xs text-gray-500 mb-0.5">{detail.label}</p>
                      <p className={`text-sm font-semibold ${detail.color}`}>
                        {detail.value}
                      </p>
                      {detail.amount !== undefined && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Rs. {detail.amount.toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {change.type !== 'neutral' && (
                <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
                  {change.type === 'positive' ? <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" /> : <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />}
                  <span className={`text-sm font-medium ${change.type === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {change.value}%
                  </span>
                  <span className="text-gray-500 text-xs ml-1">vs last</span>
                </div>
              )}
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {dashboardData.recentActivities.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No recent activities</p>
            </div>
          ) : (
            dashboardData.recentActivities.map((activity) => {
              const IconComponent = activity.icon;
              return (
                <div key={activity.id} className="p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                  <div className={`p-2 rounded-lg inline-block mb-2 ${
                    activity.type === 'pet' ? 'bg-pink-100 text-pink-600' :
                    activity.type === 'donation' ? 'bg-green-100 text-green-600' :
                    activity.type === 'adoption' ? 'bg-purple-100 text-purple-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">{activity.action}</p>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{activity.details}</p>
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {error && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Warning</h4>
              <p className="text-sm text-yellow-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
        </div>
      </div>
  );
}

export default AdminDashboard;