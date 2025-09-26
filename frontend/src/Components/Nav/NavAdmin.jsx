import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Menu, 
  LayoutDashboard, 
  Heart, 
  DollarSign, 
  Users, 
  ShoppingBag,
  User,
  Stethoscope,
  Package,
  LogOut
} from "lucide-react";
import logo from "./logo.jpg";


const NavAdmin = ({ collapsed, setCollapsed }) => {
  const location = useLocation();

  // Get admin data from localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userRole = localStorage.getItem('userRole') || 'Admin';

  const navItems = [
    { 
      name: "Dashboard", 
      path: "/admin", 
      icon: LayoutDashboard 
    },
    { 
      name: "Pet Management", 
      path: "/admin/pets", 
      icon: Heart 
    },
    { 
      name: "Healthcare Management", 
      path: "/admin/healthcare", 
      icon: Stethoscope 
    },
    { 
      name: "Donation Management", 
      path: "/admin/donations", 
      icon: DollarSign 
    },
    { 
      name: "Adoption Management", 
      path: "/admin/adoptions", 
      icon: Users 
    },
    { 
      name: "Inventory", 
      path: "/admin/inventory", 
      icon: Package 
    },
  ];

  const handleLogout = () => {
    localStorage.clear();
    // You might want to add additional logout logic here
  };

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-2xl transition-all duration-300 overflow-hidden z-50
        ${collapsed ? "w-20" : "w-64"}`}
    >
      {/* Header Section */}
      <div className="p-4 border-b border-gray-700">
        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white mb-4 p-2 rounded-lg hover:bg-purple-600 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
          style={{ backgroundColor: collapsed ? '#6638E6' : 'transparent' }}
        >
          <Menu size={20} />
        </button>

        {/* Logo + Site Name */}
        <div className="flex items-center">
          <div className="relative">
            <img
              src={logo}
              alt="Pawpal Logo"
              className={`h-10 w-10 rounded-full border-2 border-pink-400 shadow-lg transition-all duration-300 ${
                collapsed ? "mx-auto" : "mr-3"
              }`}
            />
            {/* Admin indicator - red dot */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <Link 
                to="/admin-dashboard" 
                className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hover:from-pink-400 hover:to-purple-400 transition-all duration-300"
              >
                Pawpal Admin
              </Link>
              <span className="text-xs text-gray-400">Management Portal</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`group flex items-center px-3 py-3 rounded-xl transition-all duration-300 relative overflow-hidden
                  ${isActive 
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg transform scale-105" 
                    : "hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-pink-600/20 hover:transform hover:scale-102"
                  } 
                  ${collapsed ? "justify-center" : "justify-start"}
                `}
              >
                {/* Background glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isActive ? 'opacity-100' : ''}`}></div>
                
                {/* Icon */}
                <div className="relative flex items-center justify-center">
                  <Icon 
                    size={20} 
                    className={`transition-all duration-300 ${
                      isActive 
                        ? "text-white" 
                        : "text-gray-300 group-hover:text-white"
                    } ${collapsed ? "mx-auto" : "mr-3"}`} 
                  />
                </div>
                
                {/* Text */}
                {!collapsed && (
                  <span
                    className={`relative font-medium transition-all duration-300 ease-in-out
                      ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"}
                      ${isActive ? "text-white" : "text-gray-300 group-hover:text-white"}
                    `}
                  >
                    {item.name}
                  </span>
                )}
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Admin Profile Section */}
      <div className="p-4 border-t border-gray-700">
        {/* Admin Profile */}
        <Link
          to="/admin/profile"
          className="group flex items-center px-3 py-3 rounded-xl hover:bg-gradient-to-r hover:from-pink-600/20 hover:to-purple-600/20 transition-all duration-300 relative overflow-hidden mb-2"
        >
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 to-purple-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Admin Icon */}
          <div className="relative flex items-center justify-center">
            <div className={`p-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 shadow-lg relative ${collapsed ? "mx-auto" : "mr-3"}`}>
              <User size={16} className="text-white" />
              {/* Admin badge */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></div>
            </div>
          </div>
          
          {/* Profile Text */}
          {!collapsed && (
            <div className="relative flex flex-col">
              <span className="font-medium text-gray-200 group-hover:text-white transition-colors duration-300">
                Admin Profile
              </span>
              <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                {userRole}
              </span>
            </div>
          )}
          
          {/* Hover indicator */}
          <div className="absolute right-2 w-1 h-6 bg-gradient-to-b from-pink-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Link>

        {/* Logout Section */}
        <Link
          to="/login"
          onClick={handleLogout}
          className="group flex items-center px-3 py-2 rounded-xl hover:bg-gradient-to-r hover:from-red-600/20 hover:to-pink-600/20 transition-all duration-300 relative overflow-hidden"
        >
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-pink-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Logout Icon */}
          <div className="relative flex items-center justify-center">
            <div className={`p-1 rounded-full ${collapsed ? "mx-auto" : "mr-3"}`}>
              <LogOut 
                size={16} 
                className="text-gray-400 group-hover:text-red-400 transition-colors duration-300" 
              />
            </div>
          </div>
          
          {/* Logout Text */}
          {!collapsed && (
            <span className="relative text-sm font-medium text-gray-400 group-hover:text-red-400 transition-colors duration-300">
              Logout
            </span>
          )}
        </Link>
      </div>

      {/* Bottom gradient accent - Admin themed */}
      <div className="h-1 bg-gradient-to-r from-red-600 via-purple-600 to-pink-600"></div>
    </div>
  );
};

export default NavAdmin;