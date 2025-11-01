// src/components/PrivateRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // Jika tidak ada token → redirect ke login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Jika role tidak diizinkan → redirect ke home sesuai role
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (userRole === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userRole === "user") {
      return <Navigate to="/user/home" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;