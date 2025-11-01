import React from 'react';
import logoIcon from '../assets/logo.png'; // Ganti dengan path logo Anda

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
      {/* Left Side - Menu */}
      <div className="flex space-x-8">
        <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium text-sm">About</a>
        <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium text-sm">Features</a>
        <a href="#pricing" className="text-gray-700 hover:text-blue-600 font-medium text-sm">Pricing</a>
        <a href="#gallery" className="text-gray-700 hover:text-blue-600 font-medium text-sm">Gallery</a>
        <a href="#team" className="text-gray-700 hover:text-blue-600 font-medium text-sm">Team</a>
      </div>

      {/* Center Right - Logo */}
      <div className="flex items-center space-x-2">
        <img
          src={logoIcon}
          alt="Logo Icon"
          className="w-8 h-8 rounded"
        />
      </div>

      {/* Right Side - Search Icon */}
      <div className="ml-4">
        <button className="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;