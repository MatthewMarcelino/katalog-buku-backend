// src/components/PrivateAdminRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isLoggedIn, getRole } from "../utils/auth";

const PrivateAdminRoute = () => {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (getRole() !== "admin") return <Navigate to="/login" replace />;
  return <Outlet />;
};

export default PrivateAdminRoute;
