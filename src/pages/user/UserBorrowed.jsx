// src/pages/user/UserBorrowed.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import axios from 'axios';
import { BookOpen, Calendar, CheckCircle, Clock, RotateCcw } from 'lucide-react';
import RotatingText from '@/components/RotatingText';

axios.defaults.withCredentials = true;

const UserBorrowed = () => {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [returningId, setReturningId] = useState(null);

  // 🔁 Fetch riwayat peminjaman user
  const fetchMyBorrowings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token tidak ditemukan');

      const res = await axios.get('/api/my-borrowings', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBorrowings(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching borrowings:', err);
      setError(err.response?.data?.message || 'Gagal memuat riwayat peminjaman');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBorrowings();
  }, []);

  // 🔄 Kembalikan buku
  const handleReturnBook = async (borrowingId) => {
    if (!window.confirm('Apakah Anda yakin ingin mengembalikan buku ini?')) return;

    setReturningId(borrowingId);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/borrowings/${borrowingId}/return`, {}, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      alert('✅ Buku berhasil dikembalikan!');
      fetchMyBorrowings(); // Refresh data
    } catch (err) {
      console.error('Error returning book:', err);
      alert(err.response?.data?.message || 'Gagal mengembalikan buku');
    } finally {
      setReturningId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Memuat riwayat peminjaman...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-red-600" />
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
      <Sidebar />

      <div className="flex-1 overflow-auto p-6">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 rounded-xl mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Buku Dipinjam</h1>
          <p className="text-gray-600 mt-1">Riwayat peminjaman buku Anda</p>
          <RotatingText
            texts={['Explore.', 'Learn.', ' Grow.']}
            staggerFrom={"last"}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            staggerDuration={0.025}
            splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            rotationInterval={2000}
            className="text-6xl font-bold block mx-auto" // <-- Center horizontal
          />
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Dipinjam</p>
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {borrowings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      Anda belum pernah meminjam buku.
                    </td>
                  </tr>
                ) : (
                  borrowings.map((borrowing) => (
                    <tr key={borrowing.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{borrowing.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{borrowing.book?.title || 'Buku Tidak Diketahui'}</div>
                            <div className="text-sm text-gray-500">oleh {borrowing.book?.author || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                          {new Date(borrowing.borrow_date).toLocaleDateString('id-ID')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                          {borrowing.return_date 
                            ? new Date(borrowing.return_date).toLocaleDateString('id-ID') 
                            : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          borrowing.return_date 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {borrowing.return_date ? 'Dikembalikan' : 'Dipinjam'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {!borrowing.return_date ? (
                          <button
                            onClick={() => handleReturnBook(borrowing.id)}
                            disabled={returningId === borrowing.id}
                            className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center"
                          >
                            {returningId === borrowing.id ? (
                              <RotateCcw className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            )}
                            Kembalikan
                          </button>
                        ) : (
                          <span className="text-xs text-gray-500">Sudah Dikembalikan</span>
                        )}
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

export default UserBorrowed;