import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppointmentBooking from './pages/AppoinmentForm';
import AppointmentDashboard from './pages/AppoinmentView';  
import AdminAppointmentView from './pages/AdminAppoinmetView';
import AdminHealthRec from './pages/AdminHealthRec';


function App() {
  return (
    <BrowserRouter>
      <Routes>
          
          <Route path="/appoinmentBooking" element={<AppointmentBooking />} />
          <Route path="/" element={<AdminHealthRec />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
