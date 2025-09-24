import React from 'react';
import { Link } from 'react-router-dom';

function Sidepanal() {
  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-[#6638E6] to-[#E6738F] text-white p-4 shadow-lg">
      <div className="mb-4 px-2">
        <h2 className="text-xl font-semibold">Navigation</h2>
        <p className="text-white/80 text-sm">Quick access</p>
      </div>
      <nav className="space-y-1">
        <Link
          to="/homepage"
          className="block px-3 py-2 rounded-md hover:bg-[#E69AAE] transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-[#E69AAE] focus:ring-offset-2 focus:ring-offset-[#6638E6]"
        >
          Homepage
        </Link>
        <Link
          to="/pet-management"
          className="block px-3 py-2 rounded-md hover:bg-[#E69AAE] transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-[#E69AAE] focus:ring-offset-2 focus:ring-offset-[#6638E6]"
        >
          Pet Management
        </Link>
        <Link
          to="/health-care"
          className="block px-3 py-2 rounded-md hover:bg-[#E69AAE] transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-[#E69AAE] focus:ring-offset-2 focus:ring-offset-[#6638E6]"
        >
          Health Care
        </Link>
        <Link
          to="/donation"
          className="block px-3 py-2 rounded-md hover:bg-[#E69AAE] transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-[#E69AAE] focus:ring-offset-2 focus:ring-offset-[#6638E6]"
        >
          Donation and Foster
        </Link>
        <Link
          to="/finance"
          className="block px-3 py-2 rounded-md hover:bg-[#E69AAE] transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-[#E69AAE] focus:ring-offset-2 focus:ring-offset-[#6638E6]"
        >
          Finance
        </Link>
        <Link
          to="/items"
          className="block px-3 py-2 rounded-md hover:bg-[#E69AAE] transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-[#E69AAE] focus:ring-offset-2 focus:ring-offset-[#6638E6]"
        >
          Inventory
        </Link>
        <Link
          to="/shop"
          className="block px-3 py-2 rounded-md hover:bg-[#E69AAE] transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-[#E69AAE] focus:ring-offset-2 focus:ring-offset-[#6638E6]"
        >
          Shop
        </Link>
      </nav>
    </aside>
  )
}

export default Sidepanal;

