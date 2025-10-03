import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

// Pages imports
import Dashboard from "./Pages/Dashboard";
import HomePage from "./Pages/HomePage";
import DisplayUser from "./Pages/DisplayUser";
import Pets from "./Pages/Pets";
import Adoption from "./Pages/Adoption";
import Donation from "./Pages/Donation";
import AddUser from "./Pages/AddUser";
import UpdateUser from "./Pages/UpdateUser";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import AddPet from "./Pages/AddPet";
import UpdatePet from "./Pages/UpdatePet";
import UserProfile from "./Pages/UserProfile";
import AdminDashboard from "./Pages/AdminDashboard";
import AppointmentForm from "./Pages/AppoinmentForm";
import AppointmentView from "./Pages/AppoinmentView"; 

// Components imports
import AdoptionDetails from "./Components/AdoptionDetails/AdoptionDetails";
import FosterDetails from "./Components/FosterDetails/FosterDetails";
import AdoptionDetailsDisplay from "./Components/AdoptionDetailsDisplay/AdoptionDetailsDisplay";
import FosterDetailsDisplay from "./Components/FosterDetailsDisplay/FosterDetailsDisplay";
import AdoptionViewPage from "./Components/AdoptionViewPage/AdoptionViewPage";
import FosterViewPage from "./Components/FosterViewPage/FosterViewPage";
import DonationManagement from "./Components/DonationManager/DonationManager";
import DonorForm from "./Components/DonorForm/DonorForm";
import HomeAds from "./Components/HomeAds/HomeAds";
import ManagerDashboard from "./Components/ManagerDashboard/ManagerDashboard";
import SponsorForm from "./Components/SponsorForm/SponsorForm";
import Items from "./Components/items/Items";
import ItemEdit from "./Components/items/ItemEdit";
import ItemCreate from "./Components/items/ItemCreate";
import Shop from "./Components/shop/Shop";
import DonationForm from "./Components/donation/DonationForm";
import Orders from "./Components/order/Orders";
import { CartProvider } from "./Contexts/CartContext";
import ShopAdmin from "./Components/items/Items";
import OrderConfirmationModal from "./Components/order/OrderConfirmationModal";   
import AdminPetView from "./Pages/AdminPetview";  
import AdminAddPet from "./Pages/AdminAddPet";
import AdminUpdatePet from "./Pages/AdminUpdatePet";
import VetPetView from "./Pages/VetpetView";
import UserPetProfile from "./Pages/UserPetProfile";
import AdminPetProfile from "./Pages/AdminPetProfile";
import AdminAllAppointments from "./Pages/AdminAllAppointments";
import AppointmentUpdate from "./Pages/AppoinmentUpdate";

//Vilani's Routes
import AppointmentBooking from './Pages/AppoinmentForm';
import AppointmentDashboard from './Pages/AppoinmentView';  
import AdminAppointmentView from './Pages/AdminAppoinmetView';
import AdminHealthRec from './Pages/AdminHealthRec';

import AdoptionSubmission from './Components/AdoptionSubmission/AdoptionSubmission';
import FosterSubmission from './Components/FosterSubmission/FosterSubmission';

function App() {
  const [collapsed] = useState(false);

  return (
    <div className="flex-1 p-4 transition-all duration-300">
      <CartProvider>
      <Routes>
        {/* Main routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/addpet" element={<AddPet />} />
        <Route path="/updatepet/:id" element={<UpdatePet />} />
        

        {/* Dashboard routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/displayUser" element={<DisplayUser />} />
        <Route path="/pets" element={<Pets />} />
        <Route path="/adoptionViewPage" element={<AdoptionViewPage />} />
        <Route path="/donation" element={<Donation />} />
        <Route path="/shopadmin" element={<ShopAdmin />} />
        <Route path="/addUser" element={<AddUser />} />
        <Route path="/updateuser/:id" element={<UpdateUser />} />
        <Route path="/userprofile" element={<UserProfile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/adminpets" element={<AdminPetView />} />
        <Route path="/adminaddpet" element={<AdminAddPet />} />
        <Route path="/adminupdatepet/:id" element={<AdminUpdatePet />} />
        <Route path="/appointmentview" element={<AppointmentView />} />
        <Route path="/appointmentform" element={<AppointmentForm />} />
        <Route path="/appointments/:id/edit" element={<AppointmentUpdate />} />
        <Route path="/adminAppoinmentView" element={<AdminAppointmentView />} />
        <Route path="/vetpetview" element={<VetPetView />} />
        <Route path="/userpetprofile/:id" element={<UserPetProfile />} />
        <Route path="/adminpetprofile/:id" element={<AdminPetProfile />} />
        

        {/* Component routes */}
        <Route path="/adoptionDetails" element={<AdoptionDetails />} />
        <Route path="/fosterDetails" element={<FosterDetails />} />
        <Route path="/adoptionDisplay" element={<AdoptionDetailsDisplay />} />
        <Route path="/fosterDisplay" element={<FosterDetailsDisplay />} />
        <Route path="/fosterViewPage" element={<FosterViewPage />} />
        <Route path="/adoptionViewPage" element={<AdoptionViewPage/>} />
        <Route path="/fosterViewPage" element={<FosterViewPage/>} />
        <Route path="/adoption/submitted/:id" element={<AdoptionSubmission />} />
        <Route path="/foster/submitted/:id" element={<FosterSubmission />} />
        <Route path="/donationform" element={<DonorForm />} />
        <Route path="/donations" element={<DonationManagement />} />
        <Route path="/sponsor" element={<SponsorForm />} />
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/ads" element={<HomeAds />} />
        <Route path="/items" element={<Items />} />
        <Route path="/items/new" element={<ItemCreate />} />
        <Route path="/items/:id/edit" element={<ItemEdit />} />
        <Route path="/donationsomething" element={<DonationForm />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orderconfirm" element={<OrderConfirmationModal />} />

        {/*Vilani's pages */}
        <Route path="/appointmentBooking" element={<AppointmentBooking/>}/>
        <Route path="/appointmentDashboard" element={<AppointmentDashboard/>}/>
        <Route path="/adminAppointmentView" element={<AdminAppointmentView/>}/>
        <Route path="/adminAllAppointments" element={<AdminAllAppointments/>}/>
        <Route path="/adminHealthRec/:id" element={<AdminHealthRec/>}/>
      </Routes>
      </CartProvider>
    
    </div>
  );
}

export default App;
