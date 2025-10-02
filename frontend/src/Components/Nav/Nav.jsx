import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Menu, 
  LayoutDashboard, 
  Heart, 
  Calendar,   // Icon for Appointment
  DollarSign, 
  Users, 
  ShoppingBag,
  User,
  HandHeart,  // Icon for Sponsor
  Home,       // Icon for Foster
} from "lucide-react";
import logo from "./logo.jpg";

const Nav = ({ collapsed, setCollapsed }) => {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Pets", path: "/pets", icon: Heart },
    { name: "Appointment", path: "/appointmentview", icon: Calendar },
    { name: "Donation", path: "/donationform", icon: DollarSign },
    { name: "Sponsor", path: "/sponsor", icon: HandHeart },
    { name: "Adoption", path: "/adoptionViewPage", icon: Users },
    { name: "Foster", path: "/fosterViewPage", icon: Home },
    { name: "Shop", path: "/shop", icon: ShoppingBag },
  ];

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-2xl transition-all duration-300 overflow-hidden z-50
        ${collapsed ? "w-20" : "w-64"}`}
    >
      {/* Header Section */}
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white mb-4 p-2 rounded-lg hover:bg-purple-600 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
          style={{ backgroundColor: collapsed ? '#6638E6' : 'transparent' }}
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center">
          <div className="relative">
            <img
              src={logo}
              alt="Pawpal Logo"
              className={`h-10 w-10 rounded-full border-2 border-pink-400 shadow-lg transition-all duration-300 ${collapsed ? "mx-auto" : "mr-3"}`}
            />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <Link 
                to="/dashboard" 
                className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hover:from-pink-400 hover:to-purple-400 transition-all duration-300"
              >
                Pawpal
              </Link>
              <span className="text-xs text-gray-400">Pet Management</span>
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
                <div className={`absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isActive ? 'opacity-100' : ''}`}></div>
                
                <div className="relative flex items-center justify-center">
                  <Icon 
                    size={20} 
                    className={`transition-all duration-300 ${isActive ? "text-white" : "text-gray-300 group-hover:text-white"} ${collapsed ? "mx-auto" : "mr-3"}`} 
                  />
                </div>
                
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

                {isActive && (
                  <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-700">
        <Link
          to="/userprofile"
          className="group flex items-center px-3 py-3 rounded-xl hover:bg-gradient-to-r hover:from-pink-600/20 hover:to-purple-600/20 transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 to-purple-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative flex items-center justify-center">
            <div className={`p-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 shadow-lg ${collapsed ? "mx-auto" : "mr-3"}`}>
              <User size={16} className="text-white" />
            </div>
          </div>
          
          {!collapsed && (
            <div className="relative flex flex-col">
              <span className="font-medium text-gray-200 group-hover:text-white transition-colors duration-300">
                My Profile
              </span>
              <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                View & Edit
              </span>
            </div>
          )}

          <div className="absolute right-2 w-1 h-6 bg-gradient-to-b from-pink-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Link>
      </div>

      <div className="h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600"></div>
    </div>
  );
};

export default Nav;