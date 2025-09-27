
import React from 'react';
import './App.css';
import Homepage from './Components/homepage/homepage';
import Sidepanal from './Components/sidepanal/sidepanal';
import { Routes, Route } from 'react-router-dom'; 
import Items from './Components/items/Items';
import ItemEdit from './Components/items/ItemEdit';
import ItemCreate from './Components/items/ItemCreate';
import Shop from './Components/shop/Shop';
import DonationForm from './Components/donation/DonationForm';
import Orders from './Components/order/Orders';
import { CartProvider } from './Contexts/CartContext';

function App() {
  return (
    <CartProvider>
      <div className="flex">
        <Sidepanal />
        <Routes>
            <Route path="/homepage" element={<Homepage />} />
            <Route path="/items" element={<Items/>}/>
            <Route path="/items/new" element={<ItemCreate/>}/>
            <Route path="/items/:id/edit" element={<ItemEdit/>}/>
            <Route path="/shop" element={<Shop/>}/>
            <Route path="/donation" element={<DonationForm/>}/>
            <Route path="/orders" element={<Orders/>}/>
          </Routes>
        </div>
    </CartProvider>
  );
}

export default App;


