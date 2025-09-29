export function Placeholder({ title, description }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-8">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="text-gray-600 mt-2">{description}</p>
    </div>
  );
}

export function Pets() {
  return <Placeholder title="Pets" description="Manage pet listings and profiles." />;
}

export function Donation() {
  return <Placeholder title="Donation" description="View and manage donations." />;
}

export function Sponsor() {
  return <Placeholder title="Sponsor" description="Sponsor a pet and manage sponsorships." />;
}

export function Adoption() {
  return <Placeholder title="Adoption" description="Manage adoption flow and requests." />;
}

export function Foster() {
  return <Placeholder title="Foster" description="Manage foster care and availability." />;
}

export function Shop() {
  return <Placeholder title="Shop" description="Pet shop items and orders." />;
}

export function Profile() {
  return <Placeholder title="My Profile" description="View & edit your profile." />;
}



