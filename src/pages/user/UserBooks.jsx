// src/pages/user/UserBooks.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import axios from 'axios';
import { Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

axios.defaults.withCredentials = true;

/**
 * Reusable BookCard for UserBooks
 * - Tampilan identik dengan BookCard di UserHome/Admin
 * - Hover: scale + shadow on cover frame, overlay muncul (Pinjam)
 */
const BookCard = ({ book, onBorrow }) => {
  const coverUrl = book?.cover ? `http://localhost:8000/storage/${book.cover}` : null;

  return (
    <div className="group w-56 min-w-[14rem] bg-white rounded-2xl shadow-md overflow-hidden relative border border-gray-100">
      {/* Cover area */}
      <div className="relative h-72 bg-gray-50 flex items-center justify-center">
        <div className="absolute inset-3 rounded-xl bg-white shadow-sm overflow-hidden flex items-center justify-center transition-transform duration-200 group-hover:shadow-2xl group-hover:scale-105">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={book.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/300x420?text=No+Cover';
              }}
            />
          ) : (
            <div className="text-gray-400 p-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm">No Cover</span>
            </div>
          )}
        </div>

        {/* Overlay: muncul saat hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBorrow(book.id);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition text-sm font-medium shadow-lg"
          >
            Pinjam
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm h-10">{book.title}</h3>
        <p className="text-xs text-gray-600 mt-1">oleh {book.author || '-'}</p>
      </div>
    </div>
  );
};

const UserBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const POLLING_MS = 30000; // polling opsional

  const fetchBooks = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/books', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = Array.isArray(res.data) ? res.data : [];
      setBooks(data);

      // kategori unik
      const uniqueCategories = [...new Set(data.map(b => b.category).filter(Boolean))];
      setCategories(uniqueCategories);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Gagal memuat daftar buku.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
    // Polling untuk update otomatis (opsional)
    const interval = setInterval(fetchBooks, POLLING_MS);
    return () => clearInterval(interval);
  }, [fetchBooks]);

  const handleBorrow = async (bookId) => {
    if (!window.confirm('Apakah Anda yakin ingin meminjam buku ini?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/borrowings', { book_id: bookId }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      alert('📚 Buku berhasil dipinjam!');
      // refresh buku (opsional)
      fetchBooks();
    } catch (err) {
      console.error('Error borrowing book:', err);
      alert('Gagal meminjam buku. Silakan coba lagi.');
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch =
      (book.title && book.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (book.author && book.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (book.isbn && book.isbn.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || book.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'available' && book.stock > 0) ||
      (statusFilter === 'out-of-stock' && book.stock === 0);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="sticky top-0 h-screen flex-shrink-0">
          <Sidebar />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Memuat daftar buku...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="sticky top-0 h-screen flex-shrink-0">
          <Sidebar />
        </div>

        <div className="flex-1 p-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Terjadi Kesalahan</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="sticky top-0 h-screen flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 overflow-auto p-6">
        <header className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Katalog Buku</h1>
              <p className="text-gray-600 mt-1">Jelajahi koleksi buku perpustakaan</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/user/home"
                className="text-sm px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 transition"
              >
                Kembali
              </Link>
            </div>
          </div>
        </header>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari judul, penulis, atau ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Kategori</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Status</option>
              <option value="available">Tersedia</option>
              <option value="out-of-stock">Stok Habis</option>
            </select>

            <div className="flex items-center text-sm text-gray-600">
              <Filter className="w-4 h-4 mr-2 text-gray-500" />
              <span>{filteredBooks.length} buku</span>
            </div>
          </div>
        </div>

        {filteredBooks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada buku ditemukan</h3>
            <p className="text-gray-600 mb-4">Coba ubah kata kunci atau filter pencarian.</p>
            <Link to="/user/home" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Kembali ke Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {filteredBooks.map(book => (
              <BookCard key={book.id} book={book} onBorrow={handleBorrow} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBooks;
