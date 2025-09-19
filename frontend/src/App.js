import AdoptionDetails from './Components/AdoptionDetails/AdoptionDetails';
import './App.css';
import { Routes, Route, Router } from "react-router-dom"
//import HomePage from './Pages/HomePage';
import FosterDetails from './Components/FosterDetails/FosterDetails';
import Home from './Components/Home/Home';
//import Nav from './Components/Nav/Nav';
import React from 'react';
import AdoptionDetailsDisplay from "./Components/AdoptionDetailsDisplay/AdoptionDetailsDisplay"; 
import FosterDetailsDisplay from "./Components/FosterDetailsDisplay/FosterDetailsDisplay";



function App() {

  return (
    <div >
      
      <Home></Home>
      <React.Fragment>
        <Routes>
          <Route path="" element={Home}></Route>
          <Route path="/mainhome" element={Home}></Route>
          <Route path="/adoption" element={<AdoptionDetails />} />
          <Route path="/foster" element={<FosterDetails />} />
          <Route path="/adoptionDisplay" element={<AdoptionDetailsDisplay />} />
           <Route path="/fosterDisplay" element={<FosterDetailsDisplay />} />
        </Routes>
      </React.Fragment>
    
      <h1>Hi Bozz</h1>
    </div>
  );
}

export default App;
  