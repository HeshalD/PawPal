import React, { useState, useEffect } from 'react';
import AdminNav from '../Components/Nav/NavAdmin';
import axios from 'axios';
import { 
  Users, 
  Heart, 
  DollarSign, 
  Package,
  TrendingUp,
  Calendar,
  Activity,
  Award,
  UserCheck,
  ShoppingCart,
  Bell,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Download,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Home,
  Handshake
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
      totalFosters: 0,
      shopOrders: 0,
      inventoryItems: 0
    },
    recentActivities: [],
    monthlyData: [],
    pets: [],
    users: [],
    donations: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState(null);

  // API Base URL - adjust according to your backend
  const API_BASE_URL = 'http://localhost:5000';

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch data from multiple endpoints
      const responses = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/pets`),
        axios.get(`${API_BASE_URL}/users`), 
        axios.get(`${API_BASE_URL}/donations`),
        axios.get(`${API_BASE_URL}/adoptions`),
        axios.get(`${API_BASE_URL}/sponsors`),
        axios.get(`${API_BASE_URL}/fosters`),
        axios.get(`${API_BASE_URL}/shop/orders`),
        axios.get(`${API_BASE_URL}/inventory`)
      ]);

      // Extract data from successful responses
      const [petsRes, usersRes, donationsRes, adoptionsRes, sponsorsRes, fostersRes, ordersRes, inventoryRes] = responses;

      const pets = petsRes.status === 'fulfilled' ? petsRes.value.data.pets || petsRes.value.data || [] : [];
      const users = usersRes.status === 'fulfilled' ? usersRes.value.data.users || usersRes.value.data || [] : [];
      const donations = donationsRes.status === 'fulfilled' ? donationsRes.value.data.donations || donationsRes.value.data || [] : [];
      const adoptions = adoptionsRes.status === 'fulfilled' ? adoptionsRes.value.data.adoptions || adoptionsRes.value.data || [] : [];
      const sponsors = sponsorsRes.status === 'fulfilled' ? sponsorsRes.value.data.sponsors || sponsorsRes.value.data || [] : [];
      const fosters = fostersRes.status === 'fulfilled' ? fostersRes.value.data.fosters || fostersRes.value.data || [] : [];
      const orders = ordersRes.status === 'fulfilled' ? ordersRes.value.data.orders || ordersRes.value.data || [] : [];
      const inventory = inventoryRes.status === 'fulfilled' ? inventoryRes.value.data.items || inventoryRes.value.data || [] : [];

      // Calculate statistics
      const totalDonationAmount = donations.reduce((sum, donation) => {
        return sum + (parseFloat(donation.amount) || 0);
      }, 0);

      const activeUsers = users.filter(user => {
        const lastActive = new Date(user.lastActive || user.createdAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return lastActive > thirtyDaysAgo;
      });

      const adoptedPets = pets.filter(pet => 
        pet.adoptionStatus === 'Adopted' || 
        pet.status === 'Adopted' ||
        adoptions.some(adoption => adoption.petId === pet._id)
      );

      // Generate monthly data for analytics
      const monthlyData = generateMonthlyAnalytics(pets, donations, adoptions, users);

      // Generate recent activities
      const recentActivities = generateRecentActivities(pets, donations, adoptions, users, orders);

      setDashboardData({
        stats: {
          totalPets: pets.length,
          totalDonations: totalDonationAmount,
          activeUsers: activeUsers.length,
          totalAdoptions: adoptedPets.length,
          totalSponsors: sponsors.length,
          totalFosters: fosters.length,
          shopOrders: orders.length,
          inventoryItems: inventory.length
        },
        recentActivities,
        monthlyData,
        pets,
        users,
        donations,
        adoptions,
        sponsors,
        fosters,
        orders,
        inventory
      });

      setLastUpdated(new Date());

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate monthly analytics from real data
  const generateMonthlyAnalytics = (pets, donations, adoptions, users) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentDate = new Date();
    
    return months.map((month, index) => {
      const monthDate = new Date(currentDate.getFullYear(), index, 1);
      const nextMonthDate = new Date(currentDate.getFullYear(), index + 1, 1);

      const monthPets = pets.filter(pet => {
        const petDate = new Date(pet.createdAt);
        return petDate >= monthDate && petDate < nextMonthDate;
      });

      const monthDonations = donations.filter(donation => {
        const donationDate = new Date(donation.createdAt);
        return donationDate >= monthDate && donationDate < nextMonthDate;
      });

      const monthAdoptions = adoptions.filter(adoption => {
        const adoptionDate = new Date(adoption.createdAt || adoption.adoptionDate);
        return adoptionDate >= monthDate && adoptionDate < nextMonthDate;
      });

      const monthUsers = users.filter(user => {
        const userDate = new Date(user.createdAt);
        return userDate >= monthDate && userDate < nextMonthDate;
      });

      const totalDonationAmount = monthDonations.reduce((sum, donation) => {
        return sum + (parseFloat(donation.amount) || 0);
      }, 0);

      return {
        month,
        pets: monthPets.length,
        adoptions: monthAdoptions.length,
        donations: Math.round(totalDonationAmount),
        users: monthUsers.length
      };
    });
  };

  // Generate recent activities from real data
  const generateRecentActivities = (pets, donations, adoptions, users, orders) => {
    const activities = [];

    // Recent pets (last 10)
    const recentPets = pets
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);

    recentPets.forEach(pet => {
      activities.push({
        id: `pet_${pet._id}`,
        action: 'New pet registered',
        details: `${pet.breed} - ${pet.name}`,
        time: formatTimeAgo(pet.createdAt),
        type: 'pet',
        icon: Heart,
        timestamp: new Date(pet.createdAt)
      });
    });

    // Recent donations (last 5)
    const recentDonations = donations
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);

    recentDonations.forEach(donation => {
      activities.push({
        id: `donation_${donation._id}`,
        action: 'Donation received',
        details: `$${donation.amount} from ${donation.donorName || donation.email || 'Anonymous'}`,
        time: formatTimeAgo(donation.createdAt),
        type: 'donation',
        icon: DollarSign,
        timestamp: new Date(donation.createdAt)
      });
    });

    // Recent adoptions (last 5)
    const recentAdoptions = adoptions
      .sort((a, b) => new Date(b.createdAt || b.adoptionDate) - new Date(a.createdAt || a.adoptionDate))
      .slice(0, 3);

    recentAdoptions.forEach(adoption => {
      const pet = pets.find(p => p._id === adoption.petId);
      activities.push({
        id: `adoption_${adoption._id}`,
        action: 'Pet adopted',
        details: `${pet?.name || 'Pet'} adopted by ${adoption.adopterName || adoption.adopterEmail || 'Someone'}`,
        time: formatTimeAgo(adoption.createdAt || adoption.adoptionDate),
        type: 'adoption',
        icon: UserCheck,
        timestamp: new Date(adoption.createdAt || adoption.adoptionDate)
      });
    });

    // Recent users (last 3)
    const recentUsers = users
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 2);

    recentUsers.forEach(user => {
      activities.push({
        id: `user_${user._id}`,
        action: 'New user registered',
        details: `${user.name || user.firstName + ' ' + user.lastName || user.email} joined`,
        time: formatTimeAgo(user.createdAt),
        type: 'user',
        icon: Users,
        timestamp: new Date(user.createdAt)
      });
    });

    // Recent orders (last 3)
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 2);

    recentOrders.forEach(order => {
      activities.push({
        id: `order_${order._id}`,
        action: 'Shop order completed',
        details: `Order #${order._id.slice(-6)} - $${order.total || order.amount || 'N/A'}`,
        time: formatTimeAgo(order.createdAt),
        type: 'shop',
        icon: ShoppingCart,
        timestamp: new Date(order.createdAt)
      });
    });

    // Sort by timestamp and return latest activities
    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 8);
  };

  // Format time ago helper function
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Calculate percentage change (you can enhance this with historical data)
  const calculateChange = (current) => {
    // For demo purposes, showing random changes
    // In real implementation, compare with previous period data
    const randomChange = (Math.random() - 0.5) * 20;
    return {
      value: Math.abs(randomChange).toFixed(1),
      type: randomChange >= 0 ? 'positive' : 'negative'
    };
  };

  // Auto-refresh functionality
  useEffect(() => {
    fetchDashboardData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Manual refresh
  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Export functionality
  const handleExport = () => {
    const dataToExport = {
      exportDate: new Date().toISOString(),
      stats: dashboardData.stats,
      monthlyData: dashboardData.monthlyData,
      recentActivities: dashboardData.recentActivities
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pawpal-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading && !dashboardData.stats.totalPets) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <AdminNav collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={`transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <AdminNav collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={`transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Dashboard</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={handleRefresh}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Stats configuration
  const stats = [
    {
      title: 'Total Pets',
      value: dashboardData.stats.totalPets.toLocaleString(),
      change: calculateChange(dashboardData.stats.totalPets),
      icon: Heart,
      color: 'from-pink-500 to-rose-500'
    },
    {
      title: 'Total Donations',
      value: `$${dashboardData.stats.totalDonations.toLocaleString()}`,
      change: calculateChange(dashboardData.stats.totalDonations),
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Active Users',
      value: dashboardData.stats.activeUsers.toLocaleString(),
      change: calculateChange(dashboardData.stats.activeUsers),
      icon: Users,
      color: 'from-blue-500 to-indigo-500'
    },
    {
      title: 'Total Adoptions',
      value: dashboardData.stats.totalAdoptions.toLocaleString(),
      change: calculateChange(dashboardData.stats.totalAdoptions),
      icon: UserCheck,
      color: 'from-purple-500 to-violet-500'
    },
    {
      title: 'Sponsors',
      value: dashboardData.stats.totalSponsors.toLocaleString(),
      change: calculateChange(dashboardData.stats.totalSponsors),
      icon: Handshake,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      title: 'Foster Families',
      value: dashboardData.stats.totalFosters.toLocaleString(),
      change: calculateChange(dashboardData.stats.totalFosters),
      icon: Home,
      color: 'from-cyan-500 to-blue-500'
    },
    {
      title: 'Shop Orders',
      value: dashboardData.stats.shopOrders.toLocaleString(),
      change: calculateChange(dashboardData.stats.shopOrders),
      icon: ShoppingCart,
      color: 'from-orange-500 to-amber-500'
    },
    {
      title: 'Inventory Items',
      value: dashboardData.stats.inventoryItems.toLocaleString(),
      change: calculateChange(dashboardData.stats.inventoryItems),
      icon: Package,
      color: 'from-teal-500 to-cyan-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav collapsed={collapsed} setCollapsed={setCollapsed} />
      
      {/* Main Content */}
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
              
              <button 
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  autoRefresh 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
              </button>
              
              <button 
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              <button className="relative p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
              
              <button 
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md"
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
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 relative overflow-hidden">
                {loading && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
                    <div className="h-1 bg-purple-600 animate-pulse"></div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      {stat.change.type === 'positive' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${
                        stat.change.type === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change.value}%
                      </span>
                      <span className="text-gray-500 text-sm ml-1">from last period</span>
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts and Activities Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Overview Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Analytics</h3>
              <div className="flex items-center space-x-2">
                {loading && <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>}
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Filter className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {dashboardData.monthlyData.map((data, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-12 text-sm text-gray-600 font-medium">{data.month}</div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-xs text-gray-600 w-20">Pets: {data.pets}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-1000" 
                          style={{ width: `${Math.max((data.pets / Math.max(...dashboardData.monthlyData.map(d => d.pets), 1)) * 100, 5)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      <span className="text-xs text-gray-600 w-20">Adopted: {data.adoptions}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-pink-500 h-2 rounded-full transition-all duration-1000" 
                          style={{ width: `${Math.max((data.adoptions / Math.max(...dashboardData.monthlyData.map(d => d.adoptions), 1)) * 100, 5)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-600 w-20">Donations: ${data.donations}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-1000" 
                          style={{ width: `${Math.max((data.donations / Math.max(...dashboardData.monthlyData.map(d => d.donations), 1)) * 100, 5)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Activities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 font-medium">LIVE</span>
              </div>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
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
                        activity.type === 'adoption' ? 'bg-purple-100 text-purple-600' :
                        activity.type === 'user' ? 'bg-blue-100 text-blue-600' :
                        'bg-orange-100 text-orange-600'
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
    </div>
  );
}

export default AdminDashboard;