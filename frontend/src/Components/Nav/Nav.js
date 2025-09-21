import React from "react";
import "./nav.css";
import { Link } from "react-router-dom";

function Nav() {
  return (
    <div>
      <ul className="nav-ul">
        <li className="nav-ll">
          <Link to="/ads" className="active home-a">
            Home
          </Link>
        </li>

        <li className="nav-ll">
          <Link to="/donations" className="home-a">
            Donations Details
          </Link>
        </li>

        <li className="nav-ll">
          <Link to="/" className="home-a">
          Donation Form
          </Link>
        </li>

        <li className="nav-ll">
          <Link to="/sponsor" className="home-a">
         sponsor from
          </Link>
        </li>

         <li className="nav-ll">
          <Link to="/manager" className="home-a">
         sponsor Details
          </Link>
        </li>


      </ul>
    </div>
  );
}

export default Nav;