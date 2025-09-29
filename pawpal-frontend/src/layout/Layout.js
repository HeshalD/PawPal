import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';

export default function Layout() {
  const navigate = useNavigate();
  const navItem = 'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10';
  const active = ({ isActive }) => isActive ? navItem + ' bg-white/15 text-white' : navItem;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex">
        <aside className="hidden md:flex md:w-64 min-h-screen bg-gradient-to-b from-purple-700 via-fuchsia-600 to-pink-600 p-4">
          <div className="flex flex-col w-full">
            <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 mb-6">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">P</div>
              <div className="leading-tight">
                <div className="text-white font-semibold">Pawpal</div>
                <div className="text-white/70 text-xs">Pet Management</div>
              </div>
            </Link>
            <nav className="flex-1 space-y-1">
              <NavLink to="/dashboard" className={active}>Dashboard</NavLink>
              <NavLink to="/pets" className={active}>Pets</NavLink>
              <NavLink to="/donation" className={active}>Donation</NavLink>
              <NavLink to="/sponsor" className={active}>Sponsor</NavLink>
              <NavLink to="/adoption" className={active}>Adoption</NavLink>
              <NavLink to="/foster" className={active}>Foster</NavLink>
              <NavLink to="/shop" className={active}>Shop</NavLink>
            </nav>
            <div className="mt-auto">
              <NavLink to="/profile" className={active}>My Profile</NavLink>
            </div>
          </div>
        </aside>
        <main className="flex-1 min-h-screen">
          <header className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b border-gray-100">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="md:hidden">
                <Link to="/dashboard" className="font-semibold">Pawpal</Link>
              </div>
              <div className="flex items-center gap-3">
                <button className="hidden md:inline-flex px-3 py-2 rounded-md bg-purple-600 text-white text-sm">Add Pet</button>
              </div>
            </div>
          </header>
          <div className="p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
          <button
            onClick={() => navigate('/chatbot')}
            className="fixed bottom-6 right-6 inline-flex items-center gap-2 px-4 py-3 rounded-full shadow-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            aria-label="Open Chatbot"
          >
            <span>Chatbot</span>
          </button>
        </main>
      </div>
    </div>
  );
}


