// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

// 🔐 Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// 🛡️ Route Protection
import PrivateRoute from "./components/PrivateRoute";

// 👤 User Pages
import UserHome from "./pages/user/UserHome";
import UserBooks from "./pages/user/UserBooks";
import UserBorrowed from "./pages/user/UserBorrowed";
import UserProfile from "./pages/user/UserProfile";

// 👨‍💼 Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBooks from "./pages/admin/Books";
import AdminBorrowing from "./pages/admin/Borrowing";
import AdminAddBook from "./pages/admin/AddBook";
import EditBook from "./pages/admin/EditBook";

function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      setInitialRoute("/register");
    } else if (role === "user") {
      setInitialRoute("/user/home");
    } else if (role === "admin") {
      setInitialRoute("/admin/dashboard");
    } else {
      setInitialRoute("/login");
    }
  }, []);

  // Tunggu sampai initialRoute ditentukan
  if (initialRoute === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* 🔁 Redirect root ke halaman sesuai role */}
        <Route path="/" element={<Navigate to={initialRoute} replace />} />

        {/* 🌐 Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 👤 User Protected Routes - TANPA NESTED ROUTES */}
        <Route element={<PrivateRoute allowedRoles={["user"]} />}>
          <Route path="/user/home" element={<UserHome />} />
          <Route path="/user/books" element={<UserBooks />} />
          <Route path="/user/borrowed" element={<UserBorrowed />} />
          <Route path="/user/profile" element={<UserProfile />} />
        </Route>

        {/* 👨‍💼 Admin Protected Routes */}
        <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/books" element={<AdminBooks />} />
          <Route path="/admin/borrowing" element={<AdminBorrowing />} />
          <Route path="/admin/add-book" element={<AdminAddBook />} />
          <Route path="/admin/books/:id/edit" element={<EditBook />} />
        </Route>

        {/* 🚫 Catch-all: redirect ke root jika route tidak dikenali */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;