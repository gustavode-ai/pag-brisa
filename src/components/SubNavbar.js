import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./subnavbar.css";

const SubNavbar = () => {
  const location = useLocation(); // Para identificar a rota atual

  return (
    <div className="sub-navbar">
      <ul className="navbar-links">
        <li className={location.pathname === "/sms-analise" ? "active" : ""}>
          <Link to="/sms-analise">SMS A2P</Link>
        </li>
        <li className={location.pathname === "/AcompanhamentoN2" ? "active" : ""}>
          <Link to="/AcompanhamentoN2">ACOMPANHAMENTO N2</Link>
        </li>
        <li className={location.pathname === "/Tacs" ? "active" : ""}>
          <Link to="/Tacs">TACS</Link>
        </li>
        <li className={location.pathname === "/Provisionamento" ? "active" : ""}>
          <Link to="/Provisionamento">Provisionamento</Link>
        </li>
      </ul>
    </div>
  );
};

export default SubNavbar;
