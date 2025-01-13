import React from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ element: Component }) => {
  const userRole = localStorage.getItem("userRole");
  return userRole === "admin" ? Component : <Navigate to="/" />;
};

export default AdminRoute;
