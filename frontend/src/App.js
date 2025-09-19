
import React from 'react';
import './App.css';
import Homepage from './Components/homepage/homepage';
import Sidepanal from './Components/sidepanal/sidepanal';
import { Routes, Route } from 'react-router-dom'; 
import Items from './Components/items/Items';
import ItemEdit from './Components/items/ItemEdit';
import ItemCreate from './Components/items/ItemCreate';

function App() {
  return (
    <div className="flex">
      <Sidepanal />
      <Routes>
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/items" element={<Items/>}/>
          <Route path="/items/new" element={<ItemCreate/>}/>
          <Route path="/items/:id/edit" element={<ItemEdit/>}/>
        </Routes>
      </div>
  );
}

export default App;


