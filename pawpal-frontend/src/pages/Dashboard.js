export default function Dashboard() {
  const statCard = (title, value, icon = '👤', from = 'from-blue-500', to = 'to-purple-500') => (
    <div className={`rounded-2xl p-[1px] bg-gradient-to-r ${from} ${to}`}>
      <div className="rounded-2xl bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">{title}</div>
            <div className="mt-2 text-3xl font-semibold">{value}</div>
          </div>
          <div className="text-3xl">{icon}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Welcome to Pet Care Management System</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCard('Registered Pets', '127', '💜', 'from-indigo-500', 'to-fuchsia-500')}
        {statCard('Successfully Adopted', '89', '👥', 'from-pink-500', 'to-rose-500')}
        {statCard('Active Users', '456', '👤', 'from-violet-500', 'to-purple-500')}
        {statCard('Total Donations ($)', '1234', '📦', 'from-purple-500', 'to-pink-500')}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="text-xl font-semibold mb-3">Your Pet Can Save Lives</h2>
            <p className="text-gray-600 mb-4">
              Join our comprehensive pet care management system where every pet matters. We provide a safe haven for pets in need, connecting them with loving families while ensuring they receive the best care possible.
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>Professional Healthcare: Our veterinarians provide comprehensive health monitoring and medical care.</li>
              <li>Adoption Services: We carefully match pets with suitable families through thorough screening.</li>
              <li>Complete Care Package: From nutrition to grooming supplies, we provide everything needed.</li>
            </ul>
            <div className="mt-4 flex gap-3">
              <button className="px-4 py-2 rounded-md bg-purple-600 text-white">View All Pets</button>
              <button className="px-4 py-2 rounded-md bg-gray-100">Adopt Now</button>
            </div>
          </div>
        </section>
        <aside>
          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100">View All Pets</button>
              <button className="w-full text-left px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100">Manage Users</button>
              <button className="w-full text-left px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100">Donations</button>
              <button className="w-full text-left px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100">Pet Shop</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}



