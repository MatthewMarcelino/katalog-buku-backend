// src/pages/admin/Books.jsx
import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { Search, BookOpen, Plus, Edit3, Trash2, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

axios.defaults.withCredentials = true;

/**
 * AdminBookCard
 * - Tampilan identik dengan BookCard di UserHome
 * - Inner floating frame (inset-3), rounded-2xl, group-hover scale + shadow
 * - Overlay muncul saat hover; menampilkan tombol Edit & Delete di tengah
 */
const AdminBookCard = ({ book, onEdit, onDelete, deleting }) => {
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
              <BookOpen className="w-10 h-10 mx-auto mb-2" />
              <span className="text-sm">No Cover</span>
            </div>
          )}
        </div>

        {/* Center overlay with Edit & Delete (same place/animation as user Pinjam button) */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 opacity-0 group-hover:opacity-100 transition">
          <div className="flex items-center space-x-3">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(book.id); }}
              className="p-3 bg-white bg-opacity-95 rounded-full hover:bg-opacity-100 transition shadow"
              title="Edit"
            >
              <Edit3 className="w-4 h-4 text-blue-700" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onDelete(book.id); }}
              disabled={deleting}
              className="p-3 bg-white bg-opacity-95 rounded-full hover:bg-opacity-100 transition shadow disabled:opacity-50"
              title="Hapus"
            >
              {deleting ? (
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Trash2 className="w-4 h-4 text-red-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Info area */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm h-10">{book.title}</h3>
        <p className="text-xs text-gray-600 mt-1">oleh {book.author}</p>

        <div className="mt-2 flex items-center justify-between">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStockStatusClass(book.stock)}`}>
            {getStockStatusText(book.stock)} ({book.stock})
          </span>
          <span className="text-xs text-gray-500">{book.category || '-'}</span>
        </div>
      </div>
    </div>
  );
};

// helper functions (local to this file)
const getStockStatusText = (stock) => {
  if (stock > 5) return 'Tersedia';
  if (stock > 0) return 'Stok Rendah';
  return 'Habis';
};
const getStockStatusClass = (stock) => {
  if (stock > 5) return 'bg-green-100 text-green-800';
  if (stock > 0) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  const fetchBooks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/books', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setBooks(response.data || []);
      
      const uniqueCategories = [...new Set((response.data || []).map(book => book.category))];
      setCategories(uniqueCategories.filter(cat => cat));
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Gagal memuat data buku');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
    
    // Event listener untuk refresh setelah edit/tambah/hapus
    const handleStorageChange = (e) => {
      if (e.key === 'booksDataRefresh') {
        fetchBooks();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleDelete = async (bookId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus buku ini?')) return;
    
    setDeletingId(bookId);
    try {
      await axios.get('/sanctum/csrf-cookie');
      const token = localStorage.getItem('token');
      await axios.delete(`/api/books/${bookId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      // Trigger refresh
      localStorage.setItem('booksDataRefresh', Date.now().toString());
      
    } catch (err) {
      console.error('Error deleting book:', err);
      setError('Gagal menghapus buku. Silakan coba lagi.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (bookId) => {
    // arahkan ke halaman edit admin (Link juga ada), tapi kita gunakan programmatic nav supaya overlay Edit juga bekerja
    window.location.href = `/admin/books/${bookId}/edit`;
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
        <AdminSidebar />
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
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
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
        <header className="bg-white shadow-sm p-4 rounded-xl mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Daftar Buku</h1>
              <p className="text-gray-600 mt-1">Kelola koleksi buku perpustakaan</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin/add-book"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-800 transition shadow-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Buku
              </Link>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Buku</p>
                <p className="text-2xl font-bold text-gray-900">{books.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Buku Tersedia</p>
                <p className="text-2xl font-bold text-gray-900">
                  {books.filter(book => book.stock > 0).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Stok Habis</p>
                <p className="text-2xl font-bold text-gray-900">
                  {books.filter(book => book.stock === 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari buku..."
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
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
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
              <span>{filteredBooks.length} buku ditemukan</span>
            </div>
          </div>
        </div>

        {filteredBooks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada buku ditemukan</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' 
                ? 'Coba ubah filter pencarian Anda' 
                : 'Belum ada buku di perpustakaan'}
            </p>
            <Link
              to="/admin/add-book"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Buku Pertama
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredBooks.map((book) => (
              <AdminBookCard
                key={book.id}
                book={book}
                onEdit={handleEdit}
                onDelete={handleDelete}
                deleting={deletingId === book.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Books;
