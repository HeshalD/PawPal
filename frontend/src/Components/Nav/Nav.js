import React from "react";
import "./nav.css";
import { Link } from "react-router-dom";

function Nav() {
  return (
    <div>
      <ul className="nav-ul">
        <li className="nav-ll">
          <Link to="/mainhome" className="active home-a">
            Home
          </Link> 
          <Link to="/ads" className="active home-a">
            Ads
          </Link>
        </li>

        <li className="nav-ll">
          <Link to="/adoptionViewPage" className="home-a">
             Add Adoption 
          </Link> 
          <Link to="/donations" className="home-a">
            Donations Details
          </Link>
        </li>

        <li className="nav-ll">
          <Link to="/fosterViewPage" className="home-a">
            Add Foster
          </Link> 
          <Link to="/" className="home-a">
            Donation Form
          </Link>
        </li>

        <li className="nav-ll">
          <Link to="/adoptionDisplay" className="home-a">
            Adoption Details Display
          </Link>
        </li>

        <li className="nav-ll">
          <Link to="/fosterDisplay" className="home-a">
            Foster Details Display
          </Link>
        </li>
        <li className="nav-ll">
          <Link to="/sponsor" className="home-a">
            Sponsor from
          </Link>
        </li>

         <li className="nav-ll">
          <Link to="/manager" className="home-a">
            Sponsor Details
          </Link>
        </li>


      </ul>
    </div>
  );
}

export default Nav;