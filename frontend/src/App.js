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
import AdoptionViewPage from './Components/AdoptionViewPage/AdoptionViewPage';
import FosterViewPage from './Components/FosterViewPage/FosterViewPage';
import AdoptionSubmission from './Components/AdoptionSubmission/AdoptionSubmission';
import FosterSubmission from './Components/FosterSubmission/FosterSubmission';

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
          <Route path="/adoptionViewPage" element={<AdoptionViewPage/>} />
          <Route path="/fosterViewPage" element={<FosterViewPage/>} />
          <Route path="/adoption/submitted/:id" element={<AdoptionSubmission />} />
          <Route path="/foster/submitted/:id" element={<FosterSubmission />} />
           
        </Routes>
      </React.Fragment>
    
      <h1>Hi Bozz</h1>
    </div>
  );
}

export default App;
  