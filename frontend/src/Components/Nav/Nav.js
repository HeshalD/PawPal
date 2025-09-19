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
        </li>

        <li className="nav-ll">
          <Link to="/adoption" className="home-a">
            Adoption Details
          </Link>
        </li>

        <li className="nav-ll">
          <Link to="/foster" className="home-a">
            Foster Details
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
      </ul>
    </div>
  );
}

export default Nav;