// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";

axios.defaults.withCredentials = true;

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_users: 0,
    total_books: 0,
    total_borrowed: 0,
    available_books: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const summaryResponse = await axios.get("/api/dashboard-summary", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const borrowingsResponse = await axios.get("/api/borrowings/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const totalBooks = summaryResponse.data.total_books || 0;
      const totalBorrowed = summaryResponse.data.total_borrowed || 0;
      const availableBooks = totalBooks - totalBorrowed;

      setStats({
        total_users: summaryResponse.data.total_users || 0,
        total_books: totalBooks,
        total_borrowed: totalBorrowed,
        available_books: availableBooks,
      });

      const formattedActivity = borrowingsResponse.data.slice(0, 5).map(borrowing => ({
        id: borrowing.id,
        user: borrowing.user?.name || 'User Tidak Diketahui',
        book: borrowing.book?.title || 'Buku Tidak Diketahui',
        date: new Date(borrowing.borrow_date).toLocaleDateString('id-ID'),
        status: borrowing.return_date ? 'Dikembalikan' : 'Dipinjam'
      }));

      setRecentActivity(formattedActivity);
    } catch (error) {
      console.error("Gagal memuat data dashboard:", error);
      setError("Gagal memuat data dashboard. Pastikan Anda login sebagai admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    } else {
      setLoading(false);
      setError("Token tidak ditemukan. Silakan login ulang.");
    }
    
    // ✅ Event listener untuk refresh dari halaman lain
    const handleStorageChange = (e) => {
      if (e.key === 'dashboardRefresh' && token) {
        fetchDashboardData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [token]);

  const handleRefresh = () => {
    if (token) {
      fetchDashboardData();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Memuat data dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Admin</h1>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
          >
            Refresh Data
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white shadow-sm rounded-xl p-4 md:p-6">
            <h2 className="text-xs md:text-sm text-gray-500 font-medium mb-1">Total User</h2>
            <p className="text-2xl md:text-3xl font-bold text-blue-600">{stats.total_users}</p>
          </div>
          <div className="bg-white shadow-sm rounded-xl p-4 md:p-6">
            <h2 className="text-xs md:text-sm text-gray-500 font-medium mb-1">Total Buku</h2>
            <p className="text-2xl md:text-3xl font-bold text-green-600">{stats.total_books}</p>
          </div>
          <div className="bg-white shadow-sm rounded-xl p-4 md:p-6">
            <h2 className="text-xs md:text-sm text-gray-500 font-medium mb-1">Total Peminjaman</h2>
            <p className="text-2xl md:text-3xl font-bold text-yellow-600">{stats.total_borrowed}</p>
          </div>
          <div className="bg-white shadow-sm rounded-xl p-4 md:p-6">
            <h2 className="text-xs md:text-sm text-gray-500 font-medium mb-1">Buku Tersedia</h2>
            <p className="text-2xl md:text-3xl font-bold text-teal-600">{stats.available_books}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 md:p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Aktivitas Terbaru</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="text-left text-xs md:text-sm font-medium text-gray-500 border-b border-gray-200">
                    <th className="pb-3 pr-3 md:pr-4 py-3">ID</th>
                    <th className="pb-3 pr-3 md:pr-4 py-3">User</th>
                    <th className="pb-3 pr-3 md:pr-4 py-3">Buku</th>
                    <th className="pb-3 pr-3 md:pr-4 py-3">Tanggal</th>
                    <th className="pb-3 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-3 pr-3 md:pr-4 text-xs md:text-sm font-medium text-gray-700">#{row.id}</td>
                        <td className="py-3 pr-3 md:pr-4 text-xs md:text-sm text-gray-600">{row.user}</td>
                        <td className="py-3 pr-3 md:pr-4 text-xs md:text-sm text-gray-600">{row.book}</td>
                        <td className="py-3 pr-3 md:pr-4 text-xs md:text-sm text-gray-600">{row.date}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              row.status === "Dipinjam"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center text-gray-500 py-6 text-sm"
                      >
                        Belum ada aktivitas terbaru.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;