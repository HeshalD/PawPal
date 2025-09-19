import React from 'react';
import { Link } from 'react-router-dom';

function Sidepanal() {
  return (
    <aside className="w-64 min-h-screen bg-[#4CB5AE] text-white p-4 shadow-lg">
      <div className="mb-4 px-2">
        <h2 className="text-xl font-semibold">Navigation</h2>
        <p className="text-white/80 text-sm">Quick access</p>
      </div>
      <nav className="space-y-1">
        <Link
          to="/homepage"
          className="block px-3 py-2 rounded-md hover:bg-white/10 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-[#FFA45B] focus:ring-offset-2 focus:ring-offset-[#4CB5AE]"
        >
          Homepage
        </Link>
        <Link
          to="/pet-management"
          className="block px-3 py-2 rounded-md hover:bg-white/10 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-[#FFA45B] focus:ring-offset-2 focus:ring-offset-[#4CB5AE]"
        >
          Pet Management
        </Link>
        <Link
          to="/health-care"
          className="block px-3 py-2 rounded-md hover:bg-white/10 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-[#FFA45B] focus:ring-offset-2 focus:ring-offset-[#4CB5AE]"
        >
          Health Care
        </Link>
        <Link
          to="/donation"
          className="block px-3 py-2 rounded-md hover:bg-white/10 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-[#FFA45B] focus:ring-offset-2 focus:ring-offset-[#4CB5AE]"
        >
          Donation and Foster
        </Link>
        <Link
          to="/finance"
          className="block px-3 py-2 rounded-md hover:bg-white/10 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-[#FFA45B] focus:ring-offset-2 focus:ring-offset-[#4CB5AE]"
        >
          Finance
        </Link>
        <Link
          to="/items"
          className="block px-3 py-2 rounded-md hover:bg-white/10 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-[#FFA45B] focus:ring-offset-2 focus:ring-offset-[#4CB5AE]"
        >
          Inventory
        </Link>
      </nav>
    </aside>
  )
}

export default Sidepanal;

