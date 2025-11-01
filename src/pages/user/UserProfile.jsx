// src/pages/user/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import axios from 'axios';
import { Calendar, User, Mail, Shield } from 'lucide-react';

axios.defaults.withCredentials = true;

const UserProfile = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    role: '',
    created_at: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token tidak ditemukan. Silakan login ulang.');
        }

        const res = await axios.get('/api/user', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser({
          name: res.data.name || 'Tidak ada nama',
          email: res.data.email || 'Tidak ada email',
          role: res.data.role || 'user',
          // Format tanggal menjadi lebih manusiawi, misal: 14 Maret 2023
          created_at: res.data.created_at
            ? new Date(res.data.created_at).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : 'Tidak diketahui',
        });
        setLoading(false);
      } catch (err) {
        console.error('Gagal memuat profil:', err);
        setError(
          err.response?.data?.message ||
            'Gagal memuat data profil. Silakan coba lagi.'
        );
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Memuat profil...</p>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.732 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Gagal Memuat Profil
              </h3>
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
          <h1 className="text-2xl font-bold text-gray-800">Profil Pengguna</h1>
          <p className="text-gray-600 mt-1">
            Kelola informasi akun Anda di sini.
          </p>
        </header>

        {/* Konten Profil */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6 pb-6 border-b border-gray-200">
              {/* Avatar Placeholder */}
              <div className="flex-shrink-0 w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-600 mt-1">{user.email}</p>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Shield className="w-4 h-4 mr-1.5 text-gray-400" />
                  <span className="capitalize">{user.role}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Info Detail */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                    {user.name}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat Email
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                    {user.email}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 capitalize">
                    {user.role}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bergabung Sejak
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    {user.created_at}
                  </div>
                </div>
              </div>
            </div>

            {/* Tombol Aksi (Placeholder untuk Edit) */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
              <button
                // onClick={handleEditProfile} // Nanti diaktifkan
                disabled
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg cursor-not-allowed opacity-50"
              >
                Edit Profil (Coming Soon)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;