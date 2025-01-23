import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./SubNavbar";

const Subnavadmin = () => {
  const location = useLocation(); // Para identificar a rota atual

  return (
    <div className="sub-navbar">
      <ul className="navbar-links">
        
        <li className={location.pathname === "/sms-analise" ? "active" : ""}>
          <Link to="/SmsAnaliseadmin">SMS A2P</Link>
        </li>

        <li className={location.pathname === "/desbloqueio" ? "active" : ""}>
          <Link to="/desbloqueioadmin">DESBLOQUEIO</Link>
        </li>
        
        <li className={location.pathname === "/AcompanhamentoN2admin" ? "active" : ""}>
          <Link to="/AcompanhamentoN2admin">ACOMPANHAMENTO N2</Link>
        </li>

        <li className={location.pathname === "/Tacsadmin" ? "active" : ""}>
          <Link to="/Tacsadmin">TACS</Link>
        </li>

        <li className={location.pathname === "/QueryForm" ? "active" : ""}>
          <Link to="/admin-dashboard">CRIAR USUÁRIO</Link>
        </li>

      </ul>
    </div>
  );
};

export default Subnavadmin;
