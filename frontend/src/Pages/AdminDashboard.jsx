import React, { useState, useEffect } from 'react';
import AdminNav from '../Components/Nav/NavAdmin';
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
  AlertCircle
} from 'lucide-react';

function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Simulate real API calls - Replace these with your actual API endpoints
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls - Replace with actual endpoints
      const [statsResponse, activitiesResponse, analyticsResponse, systemResponse] = await Promise.all([
        // Replace with: fetch('/api/admin/stats')
        simulateApiCall('stats'),
        // Replace with: fetch('/api/admin/activities')
        simulateApiCall('activities'),
        // Replace with: fetch('/api/admin/analytics')
        simulateApiCall('analytics'),
        // Replace with: fetch('/api/admin/system-status')
        simulateApiCall('system')
      ]);

      setDashboardData({
        stats: statsResponse,
        activities: activitiesResponse,
        analytics: analyticsResponse,
        systemStatus: systemResponse
      });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Simulate API call - Replace this with actual API calls
  const simulateApiCall = async (endpoint) => {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();
    
    switch (endpoint) {
      case 'stats':
        return {
          totalPets: 247 + Math.floor(Math.random() * 10),
          totalDonations: 24890 + Math.floor(Math.random() * 1000),
          activeUsers: 1342 + Math.floor(Math.random() * 50),
          totalAdoptions: 89 + Math.floor(Math.random() * 5),
          shopOrders: 156 + Math.floor(Math.random() * 10),
          inventoryItems: 432 + Math.floor(Math.random() * 20),
          // Previous month data for comparison
          previousData: {
            totalPets: 235,
            totalDonations: 22890,
            activeUsers: 1167,
            totalAdoptions: 72,
            shopOrders: 159,
            inventoryItems: 408
          }
        };
      
      case 'activities':
        return [
          {
            id: Date.now() + 1,
            action: 'New pet registered',
            details: `${['Golden Retriever', 'Labrador', 'Persian Cat', 'German Shepherd'][Math.floor(Math.random() * 4)]} - ${['Max', 'Bella', 'Charlie', 'Luna'][Math.floor(Math.random() * 4)]}`,
            time: `${Math.floor(Math.random() * 3) + 1} hours ago`,
            type: 'pet',
            icon: Heart,
            timestamp: currentDate
          },
          {
            id: Date.now() + 2,
            action: 'Donation received',
            details: `$${Math.floor(Math.random() * 500) + 50} from ${['John Smith', 'Sarah Wilson', 'Mike Johnson', 'Emma Davis'][Math.floor(Math.random() * 4)]}`,
            time: `${Math.floor(Math.random() * 5) + 1} hours ago`,
            type: 'donation',
            icon: DollarSign,
            timestamp: new Date(currentDate - Math.random() * 5 * 60 * 60 * 1000)
          },
          {
            id: Date.now() + 3,
            action: 'Pet adopted',
            details: `${['Bella', 'Max', 'Charlie', 'Luna'][Math.floor(Math.random() * 4)]} adopted by ${['Sarah Johnson', 'Mike Brown', 'Lisa Garcia'][Math.floor(Math.random() * 3)]}`,
            time: `${Math.floor(Math.random() * 24) + 1} hours ago`,
            type: 'adoption',
            icon: UserCheck,
            timestamp: new Date(currentDate - Math.random() * 24 * 60 * 60 * 1000)
          },
          {
            id: Date.now() + 4,
            action: 'New user registered',
            details: `${['Alex Wilson', 'Jessica Taylor', 'David Martinez'][Math.floor(Math.random() * 3)]} joined`,
            time: `${Math.floor(Math.random() * 2) + 1} days ago`,
            type: 'user',
            icon: Users,
            timestamp: new Date(currentDate - Math.random() * 2 * 24 * 60 * 60 * 1000)
          },
          {
            id: Date.now() + 5,
            action: 'Shop order completed',
            details: `Order #${Math.floor(Math.random() * 9000) + 1000} - $${Math.floor(Math.random() * 200) + 20}.99`,
            time: `${Math.floor(Math.random() * 3) + 1} days ago`,
            type: 'shop',
            icon: ShoppingCart,
            timestamp: new Date(currentDate - Math.random() * 3 * 24 * 60 * 60 * 1000)
          }
        ];
      
      case 'analytics':
        return Array.from({ length: 6 }, (_, i) => ({
          month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
          pets: Math.floor(Math.random() * 20) + 20,
          adoptions: Math.floor(Math.random() * 15) + 10,
          donations: Math.floor(Math.random() * 1500) + 2000,
          users: Math.floor(Math.random() * 100) + 50
        }));
      
      case 'system':
        return {
          database: { status: 'online', uptime: '99.8%' },
          paymentGateway: { status: 'active', lastTransaction: '2 minutes ago' },
          emailService: { status: 'running', emailsSent: 1247 },
          backupSystem: { status: Math.random() > 0.8 ? 'warning' : 'scheduled', lastBackup: '6 hours ago' },
          server: { status: 'online', cpuUsage: Math.floor(Math.random() * 30) + 20, memoryUsage: Math.floor(Math.random() * 40) + 30 }
        };
      
      default:
        return null;
    }
  };

  // Calculate percentage change
  const calculateChange = (current, previous) => {
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      type: change >= 0 ? 'positive' : 'negative'
    };
  };

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    fetchDashboardData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Manual refresh
  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (loading && !dashboardData) {
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

  const stats = dashboardData ? [
    {
      title: 'Total Pets',
      value: dashboardData.stats.totalPets.toLocaleString(),
      change: calculateChange(dashboardData.stats.totalPets, dashboardData.stats.previousData.totalPets),
      icon: Heart,
      color: 'from-pink-500 to-rose-500'
    },
    {
      title: 'Total Donations',
      value: `$${dashboardData.stats.totalDonations.toLocaleString()}`,
      change: calculateChange(dashboardData.stats.totalDonations, dashboardData.stats.previousData.totalDonations),
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Active Users',
      value: dashboardData.stats.activeUsers.toLocaleString(),
      change: calculateChange(dashboardData.stats.activeUsers, dashboardData.stats.previousData.activeUsers),
      icon: Users,
      color: 'from-blue-500 to-indigo-500'
    },
    {
      title: 'Total Adoptions',
      value: dashboardData.stats.totalAdoptions.toLocaleString(),
      change: calculateChange(dashboardData.stats.totalAdoptions, dashboardData.stats.previousData.totalAdoptions),
      icon: UserCheck,
      color: 'from-purple-500 to-violet-500'
    },
    {
      title: 'Shop Orders',
      value: dashboardData.stats.shopOrders.toLocaleString(),
      change: calculateChange(dashboardData.stats.shopOrders, dashboardData.stats.previousData.shopOrders),
      icon: ShoppingCart,
      color: 'from-orange-500 to-amber-500'
    },
    {
      title: 'Inventory Items',
      value: dashboardData.stats.inventoryItems.toLocaleString(),
      change: calculateChange(dashboardData.stats.inventoryItems, dashboardData.stats.previousData.inventoryItems),
      icon: Package,
      color: 'from-teal-500 to-cyan-500'
    }
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminNav collapsed={collapsed} setCollapsed={setCollapsed} />
      
      {/* Main Content */}
      <div>
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-6">
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
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        <span className="text-gray-500 text-sm ml-1">from last month</span>
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
              
              {dashboardData?.analytics && (
                <div className="space-y-4">
                  {dashboardData.analytics.map((data, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-12 text-sm text-gray-600 font-medium">{data.month}</div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-xs text-gray-600 w-20">Pets: {data.pets}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full transition-all duration-1000" 
                              style={{ width: `${(data.pets / Math.max(...dashboardData.analytics.map(d => d.pets))) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                          <span className="text-xs text-gray-600 w-20">Adopted: {data.adoptions}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-pink-500 h-2 rounded-full transition-all duration-1000" 
                              style={{ width: `${(data.adoptions / Math.max(...dashboardData.analytics.map(d => d.adoptions))) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-600 w-20">Donations: ${data.donations}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-1000" 
                              style={{ width: `${(data.donations / Math.max(...dashboardData.analytics.map(d => d.donations))) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Real-time Activities */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Live Activity Feed</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">LIVE</span>
                </div>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {dashboardData?.activities?.map((activity) => {
                  const IconComponent = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors animate-fadeIn">
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
                })}
              </div>
            </div>
          </div>

          {/* System Status & Server Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">System Status</h3>
              {dashboardData?.systemStatus && (
                <div className="space-y-4">
                  {Object.entries(dashboardData.systemStatus).map(([key, service]) => {
                    if (key === 'server') return null; // Handle server separately
                    
                    const getStatusColor = (status) => {
                      switch (status) {
                        case 'online':
                        case 'active':
                        case 'running':
                        case 'scheduled':
                          return 'green';
                        case 'warning':
                          return 'yellow';
                        case 'offline':
                        case 'error':
                          return 'red';
                        default:
                          return 'gray';
                      }
                    };

                    const color = getStatusColor(service.status);
                    const serviceName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

                    return (
                      <div key={key} className={`flex items-center justify-between p-3 bg-${color}-50 rounded-lg`}>
                        <div className="flex items-center space-x-3">
                          {color === 'green' ? (
                            <CheckCircle className={`w-5 h-5 text-${color}-500`} />
                          ) : color === 'yellow' ? (
                            <AlertCircle className={`w-5 h-5 text-${color}-500`} />
                          ) : (
                            <Activity className={`w-5 h-5 text-${color}-500`} />
                          )}
                          <span className="text-sm font-medium text-gray-700">{serviceName}</span>
                        </div>
                        <span className={`text-sm text-${color}-600 font-medium capitalize`}>
                          {service.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Server Metrics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Server Metrics</h3>
              {dashboardData?.systemStatus?.server && (
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">CPU Usage</span>
                      <span className="text-sm text-gray-600">{dashboardData.systemStatus.server.cpuUsage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ${
                          dashboardData.systemStatus.server.cpuUsage > 80 ? 'bg-red-500' :
                          dashboardData.systemStatus.server.cpuUsage > 60 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${dashboardData.systemStatus.server.cpuUsage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Memory Usage</span>
                      <span className="text-sm text-gray-600">{dashboardData.systemStatus.server.memoryUsage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ${
                          dashboardData.systemStatus.server.memoryUsage > 80 ? 'bg-red-500' :
                          dashboardData.systemStatus.server.memoryUsage > 60 ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}
                        style={{ width: `${dashboardData.systemStatus.server.memoryUsage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">99.9%</p>
                      <p className="text-xs text-gray-500">Uptime</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">24ms</p>
                      <p className="text-xs text-gray-500">Response Time</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;