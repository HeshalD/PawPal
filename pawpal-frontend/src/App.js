import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layout/Layout';
import Dashboard from './pages/Dashboard';
import HealthRecords from './pages/HealthRecords';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Chatbot from './pages/Chatbot';
import { Pets, Donation, Sponsor, Adoption, Foster, Shop, Profile } from './pages/Placeholders';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pets" element={<Pets />} />
          <Route path="/donation" element={<Donation />} />
          <Route path="/sponsor" element={<Sponsor />} />
          <Route path="/adoption" element={<Adoption />} />
          <Route path="/foster" element={<Foster />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/health-records" element={<HealthRecords />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/chatbot" element={<Chatbot />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
