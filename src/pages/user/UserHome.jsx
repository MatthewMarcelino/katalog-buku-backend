// src/pages/user/UserHome.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import axios from 'axios';
import InfiniteScroll from '../../components/InfiniteScroll';
import BlurText from '../../components/BlurText';


axios.defaults.withCredentials = true;

/** Reusable BookCard (sama untuk Recommended & Read All) */
const BookCard = ({ book, onBorrow }) => {
  const coverUrl = book?.cover ? `http://localhost:8000/storage/${book.cover}` : null;

  return (
    <div className="group w-56 min-w-[14rem] bg-white rounded-2xl shadow-md overflow-hidden relative border border-gray-100">
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

        {/* Overlay muncul saat hover */}
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

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm h-10">{book.title}</h3>
        <p className="text-xs text-gray-600 mt-1">oleh {book.author}</p>
      </div>
    </div>
  );
};

const handleAnimationComplete = () => {
  console.log('Animation completed!');
};


const UserHome = () => {
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const POLLING_MS = 30000;

  // Ambil semua buku dari backend
  const fetchBooks = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/books', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const books = Array.isArray(res.data) ? res.data : [];
      setAllBooks(books);

      // Bangun recommended dari localStorage (atau fallback ke latest 7)
      const rec = buildRecommendedFromStorage(books);
      setRecommendedBooks(rec);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Gagal memuat data buku. Silakan coba lagi.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
    const interval = setInterval(fetchBooks, POLLING_MS);
    return () => clearInterval(interval);
  }, [fetchBooks]);

  // Mengambil recommended berdasarkan daftar ID di localStorage
  const buildRecommendedFromStorage = (books) => {
    try {
      const raw = localStorage.getItem('recommended_ids');
      if (!raw) {
        // fallback: latest 7
        return [...books].sort((a, b) => b.id - a.id).slice(0, 7);
      }

      let ids = JSON.parse(raw);
      if (!Array.isArray(ids)) return [...books].sort((a, b) => b.id - a.id).slice(0, 7);

      // Map IDs -> book objects, pertahankan urutan IDs, filter yg tidak ada
      let rec = ids
        .map((id) => {
          // ID bisa string/number, cocokkan dengan book.id
          return books.find((b) => String(b.id) === String(id));
        })
        .filter(Boolean);

      // Jika kurang dari 7, tambahkan buku terbaru yang belum ada
      if (rec.length < 7) {
        const extra = [...books]
          .filter((b) => !rec.find((r) => String(r.id) === String(b.id)))
          .sort((a, b) => b.id - a.id)
          .slice(0, 7 - rec.length);
        rec = [...rec, ...extra];
      } else if (rec.length > 7) {
        rec = rec.slice(0, 7);
      }

      return rec;
    } catch (err) {
      console.warn('recommended_ids invalid JSON, fallback to latest 7', err);
      return [...books].sort((a, b) => b.id - a.id).slice(0, 7);
    }
  };

  // UI kecil untuk mengedit recommended IDs (disimpan di localStorage)
  const editRecommendedIds = () => {
    const raw = localStorage.getItem('recommended_ids') || '[]';
    const current = (() => {
      try { return JSON.parse(raw); } catch { return []; }
    })();
    const input = window.prompt(
      'Masukkan recommended book IDs (pisahkan koma). Contoh: 12,5,3,22,9,7,8\n\n(Atau kosongkan untuk fallback ke 7 terbaru)',
      current.join(',')
    );

    if (input === null) return; // cancel
    const cleaned = input
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s !== '')
      .map((s) => (isNaN(Number(s)) ? s : Number(s)));

    localStorage.setItem('recommended_ids', JSON.stringify(cleaned));
    // rebuild recommended immediately using current allBooks
    setRecommendedBooks(buildRecommendedFromStorage(allBooks));
    alert('Daftar recommended disimpan (hanya di browser ini).');
  };

  const handleBorrow = async (bookId) => {
    if (!window.confirm('Apakah Anda yakin ingin meminjam buku ini?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/borrowings',
        { book_id: bookId },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      alert('📚 Buku berhasil dipinjam!');
      fetchBooks();
    } catch (err) {
      console.error('Error borrowing book:', err);
      alert('Gagal meminjam buku. Silakan coba lagi.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="sticky top-0 h-screen flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Memuat data...</p>
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        {/* Recommended header dengan tombol Edit kecil */}
        <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Recommended for You</h2>
          </div>

          <div className="overflow-x-auto -mx-3 px-3 py-2">
            <div className="flex space-x-5">
              {recommendedBooks.map((book) => (
                <BookCard key={book.id} book={book} onBorrow={handleBorrow} />
              ))}
            </div>
          </div>
        </section>
            {/* Read All */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Read All</h2>

            {/* Flex Layout: Kolom Kiri (Teks) & Kolom Kanan (InfiniteScroll) */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Kolom Kiri: Kalimat Informatif */}
              <div className="lg:w-5/4 rounded-xl p-6">
                <h2 className="text-blue-600 text-6xl mb-4 ml-14 font-bold">LibraHub</h2>
                <p className="text-6xl mb-4 ml-10 font-bold">Explore. Learn. Grow.</p>
                <BlurText
                  text="Lebih dari sekadar membaca — ini perjalanan pengetahuanmu. Temukan bacaan yang memperluas wawasanmu. Setiap buku punya cerita, temukan ceritamu hari ini."
                  delay={200}
                  animateBy="words"
                  direction="top"
                  onAnimationComplete={handleAnimationComplete}
                  className="text-3xl mb-4 ml-10 font-semibold"
                />
              </div>
              {/* Kolom Kanan: InfiniteScroll */}
              <div className="lg:w-3/4">
                <div style={{ height: '400px', position: 'relative' }}>
                  <InfiniteScroll
                    items={allBooks.map(book => ({
                      content: (
                        <BookCard
                          book={book}
                          onBorrow={handleBorrow}
                        />
                      )
                    }))}
                    isTilted={true}
                    tiltDirection='right'
                    autoplay={true}
                    autoplaySpeed={0.7}
                    autoplayDirection="down"
                    pauseOnHover={true}
                  />
                </div>
              </div>
            </div>

            {/* Grid Buku Acak (opsional) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mt-6">
              {([...allBooks].sort(() => 0.5 - Math.random())).map((book) => (
                <BookCard key={book.id} book={book} onBorrow={handleBorrow} />
              ))}
            </div>
            
          </section>
      </div>
    </div>
  );
};

export default UserHome;