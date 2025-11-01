// src/pages/admin/EditBook.jsx
import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { Save, ArrowLeft, Image, BookOpen, User, Calendar, Package, AlertCircle } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

axios.defaults.withCredentials = true;

const EditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    publisher: '',
    year: '',
    stock: '',
    cover: null
  });
  const [currentCover, setCurrentCover] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const fetchBook = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const bookData = res.data;
      setFormData({
        title: bookData.title || '',
        author: bookData.author || '',
        publisher: bookData.publisher || '',
        year: bookData.year || '',
        stock: bookData.stock || '',
        cover: null
      });
      
      if (bookData.cover) {
        setCurrentCover(`http://localhost:8000/storage/${bookData.cover}`);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching book:', err);
      setError('Gagal memuat data buku. Silakan coba lagi.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBook();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error || success) {
      setError('');
      setSuccess(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, cover: file }));
      setPreview(URL.createObjectURL(file));
      setSuccess(false);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.title.trim() || !formData.author.trim() || !formData.year || !formData.stock) {
    setError('Harap isi semua field yang wajib diisi.');
    return;
  }

  if (isNaN(formData.year) || formData.year < 1000 || formData.year > new Date().getFullYear()) {
    setError('Tahun terbit harus antara 1000 dan tahun ini.');
    return;
  }

  if (isNaN(formData.stock) || formData.stock < 0) {
    setError('Stok tidak boleh negatif.');
    return;
  }

  setSubmitting(true);
  setError('');
  setSuccess(false);

  try {
    await axios.get('/sanctum/csrf-cookie');
    
    const token = localStorage.getItem('token');
    const formDataToSend = new FormData();

    formDataToSend.append('title', formData.title);
    formDataToSend.append('author', formData.author);
    if (formData.publisher) formDataToSend.append('publisher', formData.publisher);
    formDataToSend.append('year', formData.year);
    formDataToSend.append('stock', formData.stock);
    
    if (formData.cover) {
      formDataToSend.append('cover', formData.cover);
    }

    await axios({
      method: 'PUT',
      url: `/api/books/${id}`,
      data: formDataToSend,
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    setSuccess(true);
    
    // ✅ HARD REFRESH — SOLUSI PASTI
    setTimeout(() => {
      window.location.reload();
    }, 1500);
    
  } catch (err) {
    console.error('Error updating book:', err);
    setError(err.response?.data?.message || 'Gagal menyimpan perubahan. Silakan coba lagi.');
  } finally {
    setSubmitting(false);
  }
};

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">Memuat data buku...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <header className="bg-white shadow-sm p-4 rounded-xl mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center">
              <Link 
                to="/admin/books" 
                className="mr-3 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Edit Buku</h1>
                <p className="text-gray-600 mt-1">Perbarui informasi buku perpustakaan</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <BookOpen className="w-4 h-4 mr-1" />
              ID: #{id}
            </div>
          </div>
        </header>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center animate-fade-in">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <Save className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-green-800 font-medium">Perubahan berhasil disimpan!</p>
              <p className="text-green-700 text-sm">Mengarahkan ke daftar buku...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Image className="w-5 h-5 mr-2 text-blue-600" />
                  Sampul Buku
                </h3>
                
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center bg-white">
                  {preview ? (
                    <div className="relative">
                      <img
                        src={preview}
                        alt="Preview cover baru"
                        className="mx-auto h-48 object-contain rounded-lg"
                      />
                      <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Preview
                      </div>
                    </div>
                  ) : currentCover ? (
                    <img
                      src={currentCover}
                      alt="Cover saat ini"
                      className="mx-auto h-48 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="py-8">
                      <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <Image className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-600 text-sm">Sampul buku tidak tersedia</p>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-4 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Format: JPG, PNG, GIF (max 2MB)
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Buku <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BookOpen className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Masukkan judul buku"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Penulis <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Nama penulis"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Penerbit
                  </label>
                  <input
                    type="text"
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Nama penerbit"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tahun Terbit <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        min="1000"
                        max={new Date().getFullYear()}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="Contoh: 2023"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stok <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Package className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        min="0"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="Jumlah stok"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all duration-300 shadow-lg flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Menyimpan Perubahan...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                  
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    * Field yang ditandai wajib diisi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBook;