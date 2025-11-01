// src/pages/admin/Stock.jsx
import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';

const Stock = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Stock Buku</h1>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-gray-600">Stok buku saat ini akan ditampilkan di sini.</p>
        </div>
      </div>
    </div>
  );
};

export default Stock;