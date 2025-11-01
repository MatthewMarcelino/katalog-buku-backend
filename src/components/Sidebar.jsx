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

const Sidebar = () => {
  const navigate = useNavigate();

  // 🔐 Fungsi Logout
  const handleLogout = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      // Kalau token nggak ada, langsung redirect aja
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Bersihkan token & role dari localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("role");

      // Redirect ke halaman login
      navigate("/login");
    } catch (error) {
      console.error("Logout gagal:", error);
      // Tetap hapus data lokal agar user benar-benar keluar
      localStorage.removeItem("token");
      localStorage.removeItem("role");
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

      {/* Navigation Menu */}
      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          <li>
            <Link 
              to="/user/home" 
              className="flex items-center p-3 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-blue-600 text-lg font-bold"
            >
              <Home className="w-5 h-5 mr-3 text-gray-600 " />
              Home
            </Link>
          </li>

          <li>
            <Link 
              to="/user/books" 
              className="flex items-center p-3 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-blue-600 text-lg font-bold"
            >
              <BookOpen className="w-5 h-5 mr-3 text-gray-600" />
              Daftar Buku
            </Link>
          </li>

          <li>
            <Link 
              to="/user/borrowed" 
              className="flex items-center p-3 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-blue-600 text-lg font-bold"
            >
              <History className="w-5 h-5 mr-3 text-gray-600" />
              Buku Dipinjam
            </Link>
          </li>

          <li>
            <Link 
              to="/user/profile" 
              className="flex items-center p-3 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-blue-600 text-lg font-bold"
            >
              <User className="w-5 h-5 mr-3 text-gray-600" />
              Profil
            </Link>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={(e) => {
            e.preventDefault();
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("user");
            window.location.href = "/login"; // pakai window.location agar reload bersih
          }}
          className="flex items-center w-full text-left p-3 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-red-600 text-lg font-bold transition"
        >
          <LogOut className="w-5 h-5 mr-3 text-gray-600" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
