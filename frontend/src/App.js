
import './App.css';
import { Routes, Route, Router } from "react-router"
import DonationManagement from './Components/DonationManager/DonationManager';
import DonorForm from './Components/DonorForm/DonorForm';
import HomeAds from './Components/HomeAds/HomeAds';
import ManagerDashboard from './Components/ManagerDashboard/ManagerDashboard';
import SponsorForm from './Components/SponsorForm/SponsorForm'; 

function App() {

  return (
    <div >
      <Routes>
        <Route path="/" element={<DonorForm />} />
        <Route path="/donations" element={<DonationManagement />} />
        <Route path="/sponsor" element={<SponsorForm />} />
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/ads" element={<HomeAds />} />
      </Routes>
    </div>
  );
}

export default App;
