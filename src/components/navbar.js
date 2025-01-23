import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SubNavbar from "./SubNavbar";
import "./navbar.css";
import { MdKeyboardDoubleArrowDown } from "react-icons/md";


const Navbar = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isButtonMoved, setIsButtonMoved] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/");
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const toggleNavbar = () => {
    setIsNavbarVisible((prev) => !prev);
    setIsButtonMoved((prev) => !prev); // Alterna a posição do botão
  };

  const userName = localStorage.getItem("userName") || "";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <>
      <div className={`navbar-container ${isNavbarVisible ? "visible" : ""}`}>
        <nav className="navbar">
          <div className="navbar-brand">
            <img src={`${process.env.PUBLIC_URL}/Logo.svg`} alt="icon" className="ico" />
            <a href="/QueryForm">NetCore</a>
          </div>

          <div className="avatar" onClick={toggleDropdown}>
            {userInitial}
            {dropdownOpen && (
              <div className="dropdown-menu">
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </nav>
        <SubNavbar />
      </div>
      <div
        className={`navbar-toggle ${isButtonMoved ? "moved" : ""}`}
        onClick={toggleNavbar}
      >
        <MdKeyboardDoubleArrowDown
          className={`toggle-icon ${isNavbarVisible ? "rotated" : ""}`}
        />
      </div>
    </>
  );
};

export default Navbar;
