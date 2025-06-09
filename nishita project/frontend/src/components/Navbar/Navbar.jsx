import React, { useContext, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import LoginPopup from "../LoginPopup/LoginPopup";
import { StoreContext } from "../../context/StoreContext";

const Navbar = () => {
  const [menu, setMenu] = useState("home");
  const [showLogin, setShowLogin] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const dropdownRef = useRef(null);
  const { getTotalCartAmount } = useContext(StoreContext);

  useEffect(() => {
    const token = sessionStorage.getItem("token");  // use sessionStorage instead of localStorage
    setIsLoggedIn(!!token);
  }, [showLogin]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleShowLogin = () => setShowLogin(true);

  const handleLogout = () => {
    sessionStorage.removeItem("token");  // clear token from sessionStorage
    setIsLoggedIn(false);
    setDropdownOpen(false);
    setShowLogin(true); // Show login popup after logout
  };

  return (
    <>
      <div className="navbar">
        <Link to="/">
          <img src={assets.logo} alt="logo" className="logo" />
        </Link>

        <ul className="navbar-menu">
          <Link to="/" onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>
            Home
          </Link>
          <a href="#explore-menu" onClick={() => setMenu("menu")} className={menu === "menu" ? "active" : ""}>
            Menu
          </a>
          <a href="#app-download" onClick={() => setMenu("mobile-app")} className={menu === "mobile-app" ? "active" : ""}>
            Mobile App
          </a>
          <a href="#footer" onClick={() => setMenu("Contactus")} className={menu === "Contactus" ? "active" : ""}>
            Contact Us
          </a>
        </ul>

        <div className="navbar-right">
          {/* <Link to="/">
            <img src={assets.search_icon} alt="search" />
          </Link> */}

          <Link to="/cart">
            <img src={assets.basket_icon} alt="basket" />
            <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
          </Link>

          {!isLoggedIn && (
            <button className="signbutton" onClick={handleShowLogin}>
              Sign in
            </button>
          )}

          {isLoggedIn && (
            <div className="dropdown-container" ref={dropdownRef}>
              <img
                src={assets.profile_icon}
                alt="profile"
                className="navbar-icon"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <Link to="/myorders" onClick={() => setDropdownOpen(false)}>
                    <img src={assets.order_icon} alt="order-icon" className="dropdown-icon" />
                    Orders
                  </Link>
                  <span onClick={handleLogout}>
                    <img src={assets.logout_icon} alt="logout-icon" className="dropdown-icon" />
                    Logout
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Login Popup */}
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
    </>
  );
};

export default Navbar;
