// src/components/AdminSidebar.jsx
import React from 'react';
import { 
  Home, 
  BookOpen, 
  History, 
  User, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logoIcon from '../assets/logo.png';

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    try {
      if (token) {
        await axios.post(
          "http://127.0.0.1:8000/api/logout",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error("Logout gagal:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <div className="w-64 bg-white h-screen shadow-lg flex flex-col">
      {/* Logo */}
      <div className="flex items-center p-6 border-b">
        <div className="rounded-md p-2 mr-3">
          <img
            src={logoIcon}
            alt="Logo Icon"
            className="w-16 h-16 rounded"
          />
        </div>
        <h1 className="text-xl font-bold text-gray-800">LibraHub</h1>
      </div>

      {/* Navigation Menu - SESUAIKAN UNTUK ADMIN */}
      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          <li>
            <Link 
              to="/admin/dashboard" 
              className="flex items-center p-3 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-blue-600 text-lg font-bold"
            >
              <Home className="w-5 h-5 mr-3 text-gray-600" />
              Dashboard
            </Link>
          </li>

          <li>
            <Link 
              to="/admin/books" 
              className="flex items-center p-3 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-blue-600 text-lg font-bold"
            >
              <BookOpen className="w-5 h-5 mr-3 text-gray-600" />
              Daftar Buku
            </Link>
          </li>

          <li>
            <Link 
              to="/admin/borrowing" 
              className="flex items-center p-3 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-blue-600 text-lg font-bold"
            >
              <History className="w-5 h-5 mr-3 text-gray-600" />
              Peminjaman
            </Link>
          </li>

          <li>
            <Link 
              to="/admin/add-book" 
              className="flex items-center p-3 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-blue-600 text-lg font-bold"
            >
              <User className="w-5 h-5 mr-3 text-gray-600" />
              Tambah Buku
            </Link>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center w-full text-left p-3 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-red-600 text-lg font-bold transition"
        >
          <LogOut className="w-5 h-5 mr-3 text-gray-600" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;