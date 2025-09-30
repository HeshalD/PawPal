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

//Vilani's Routes
import AppointmentBooking from './Pages/AppoinmentForm';
import AppointmentDashboard from './Pages/AppoinmentView';  
import AdminAppointmentView from './Pages/AdminAppoinmetView';
import AdminHealthRec from './Pages/AdminHealthRec';




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
        <Route path="/pets/:id" element={<UpdatePet />} />
        

        {/* Dashboard routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/displayUser" element={<DisplayUser />} />
        <Route path="/pets" element={<Pets />} />
        <Route path="/adoptionViewPage" element={<AdoptionViewPage />} />
        <Route path="/donation" element={<Donation />} />
        <Route path="/shopadmin" element={<ShopAdmin />} />
        <Route path="/addUser" element={<AddUser />} />
        <Route path="/displayUser/:id" element={<UpdateUser />} />
        <Route path="/userprofile" element={<UserProfile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/adminpets" element={<AdminPetView />} />
        <Route path="/adminaddpet" element={<AdminAddPet />} />
        <Route path="/adminupdatepet/:id" element={<AdminUpdatePet />} />
        

        {/* Component routes */}
        <Route path="/adoptionDetails" element={<AdoptionDetails />} />
        <Route path="/fosterDetails" element={<FosterDetails />} />
        <Route path="/adoptionDisplay" element={<AdoptionDetailsDisplay />} />
        <Route path="/fosterDisplay" element={<FosterDetailsDisplay />} />
        <Route path="/fosterViewPage" element={<FosterViewPage />} />
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
        <Route path="/adminHealthRec" element={<AdminHealthRec/>}/>
      </Routes>
      </CartProvider>
    
    </div>
  );
}

export default App;
