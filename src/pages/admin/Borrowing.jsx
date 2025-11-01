// src/pages/admin/Borrowing.jsx
import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { Search, Calendar, User, BookOpen, Clock, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

// ✅ Konfigurasi untuk Sanctum + Proxy
axios.defaults.withCredentials = true;
const API_BASE = '/api'; // Gunakan proxy Vite

const Borrowing = () => {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState(null);

  // Fetch borrowing data from API
  useEffect(() => {
    const fetchBorrowings = async () => {
      try {
        const token = localStorage.getItem('token');
        // ✅ Gunakan endpoint yang benar
        const response = await axios.get(`${API_BASE}/borrowings/all`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // ✅ Format data sesuai struktur backend Anda
        const formattedData = response.data.map(item => ({
          ...item,
          formattedBorrowDate: item.borrow_date ? new Date(item.borrow_date).toLocaleDateString('id-ID') : '-',
          formattedReturnDate: item.return_date ? new Date(item.return_date).toLocaleDateString('id-ID') : '-',
          // Ambil data dari relasi
          user_name: item.user?.name || 'User Tidak Diketahui',
          user_email: item.user?.email || '',
          book_title: item.book?.title || 'Buku Tidak Diketahui',
          author: item.book?.author || 'Tidak Diketahui'
        }));
        
        setBorrowings(formattedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching borrowings:', err);
        setError('Gagal memuat data peminjaman');
        setLoading(false);
      }
    };

    fetchBorrowings();
  }, []);

  // Filter data based on search and status
  const filteredBorrowings = borrowings.filter(borrowing => {
    const matchesSearch = 
      borrowing.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrowing.book_title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && !borrowing.return_date) ||
      (statusFilter === 'returned' && borrowing.return_date);
    
    return matchesSearch && matchesStatus;
  });

  // Get status badge styling
  const getStatusBadge = (isReturned) => {
    if (isReturned) {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-yellow-100 text-yellow-800';
  };

  // Get status text
  const getStatusText = (isReturned) => {
    return isReturned ? 'Dikembalikan' : 'Dipinjam';
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Memuat data peminjaman...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Terjadi Kesalahan</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto p-6">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 rounded-xl mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Manajemen Peminjaman</h1>
              <p className="text-gray-600 mt-1">Kelola semua peminjaman buku oleh pengguna</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari peminjaman..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="active">Sedang Dipinjam</option>
                <option value="returned">Sudah Dikembalikan</option>
              </select>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Peminjaman</p>
                <p className="text-2xl font-bold text-gray-900">{borrowings.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sedang Dipinjam</p>
                <p className="text-2xl font-bold text-gray-900">
                  {borrowings.filter(b => !b.return_date).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sudah Dikembalikan</p>
                <p className="text-2xl font-bold text-gray-900">
                  {borrowings.filter(b => b.return_date).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Borrowing Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pengguna
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buku
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Pinjam
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Kembali
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBorrowings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      Tidak ada data peminjaman yang ditemukan
                    </td>
                  </tr>
                ) : (
                  filteredBorrowings.map((borrowing) => (
                    <tr key={borrowing.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{borrowing.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{borrowing.user_name}</div>
                            <div className="text-sm text-gray-500">{borrowing.user_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{borrowing.book_title}</div>
                        <div className="text-sm text-gray-500">oleh {borrowing.author}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                          {borrowing.formattedBorrowDate}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                          {borrowing.formattedReturnDate}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(!!borrowing.return_date)}`}>
                          {getStatusText(!!borrowing.return_date)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Borrowing;