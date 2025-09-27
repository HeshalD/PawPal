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
import ShopAdmin from "./Pages/Shop";
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
import Home from "./Components/Home/Home";
import AdoptionDetailsDisplay from "./Components/AdoptionDetailsDisplay/AdoptionDetailsDisplay";
import FosterDetailsDisplay from "./Components/FosterDetailsDisplay/FosterDetailsDisplay";
import AdoptionViewPage from "./Components/AdoptionViewPage/AdoptionViewPage";
import FosterViewPage from "./Components/FosterViewPage/FosterViewPage";
import DonationManagement from "./Components/DonationManager/DonationManager";
import DonorForm from "./Components/DonorForm/DonorForm";
import HomeAds from "./Components/HomeAds/HomeAds";
import ManagerDashboard from "./Components/ManagerDashboard/ManagerDashboard";
import SponsorForm from "./Components/SponsorForm/SponsorForm";
import ItemsHomepage from "./Components/homepage/homepage";
import Sidepanal from "./Components/sidepanal/sidepanal";
import Items from "./Components/items/Items";
import ItemEdit from "./Components/items/ItemEdit";
import ItemCreate from "./Components/items/ItemCreate";
import Shop from "./Components/shop/Shop";
import DonationForm from "./Components/donation/DonationForm";
import Orders from "./Components/order/Orders";
import { CartProvider } from "./Contexts/CartContext";

import Nav from "./Components/Nav/Nav";

function App() {
  const [collapsed] = useState(false);

  return (
    <div className="flex-1 p-4 transition-all duration-300">
      <Routes>
        {/* Main routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/mainhome" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/addpet" element={<AddPet />} />
        <Route path="/pets/:id" element={<UpdatePet />} />
        <Route path="/nav" element={<Nav />} />

        {/* Dashboard routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/displayUser" element={<DisplayUser />} />
        <Route path="/pets" element={<Pets />} />
        <Route path="/adoption" element={<Adoption />} />
        <Route path="/donation" element={<Donation />} />
        <Route path="/shopadmin" element={<ShopAdmin />} />
        <Route path="/addUser" element={<AddUser />} />
        <Route path="/displayUser/:id" element={<UpdateUser />} />
        <Route path="/userprofile" element={<UserProfile />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Component routes */}
        <Route path="/adoptionDetails" element={<AdoptionDetails />} />
        <Route path="/fosterDetails" element={<FosterDetails />} />
        <Route path="/adoptionDisplay" element={<AdoptionDetailsDisplay />} />
        <Route path="/fosterDisplay" element={<FosterDetailsDisplay />} />
        <Route path="/adoptionViewPage" element={<AdoptionViewPage />} />
        <Route path="/fosterViewPage" element={<FosterViewPage />} />
        <Route path="/donationform" element={<DonorForm />} />
        <Route path="/donations" element={<DonationManagement />} />
        <Route path="/sponsor" element={<SponsorForm />} />
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/ads" element={<HomeAds />} />
        <Route path="/itemsHomepage" element={<ItemsHomepage />} />
        <Route path="/items" element={<Items />} />
        <Route path="/items/new" element={<ItemCreate />} />
        <Route path="/items/:id/edit" element={<ItemEdit />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/donationsomething" element={<DonationForm />} />
        <Route path="/orderssomething" element={<Orders />} />
      </Routes>
    
    </div>
  );
}

export default App;
