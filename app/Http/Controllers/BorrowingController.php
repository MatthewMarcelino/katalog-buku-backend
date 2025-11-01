<?php

namespace App\Http\Controllers;

use App\Models\Borrowing;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BorrowingController extends Controller
{
    // ========================
    // USER SECTION
    // ========================

    // Lihat semua peminjaman user login
    public function index()
    {
        $borrowings = Borrowing::with('book')
            ->where('user_id', Auth::id())
            ->get();

        return response()->json($borrowings);
    }

    // Pinjam buku
    public function store(Request $request)
    {
        $request->validate([
            'book_id' => 'required|exists:books,id',
        ]);

        // ✅ Cek apakah user sudah meminjam buku ini dan belum dikembalikan
        if (Borrowing::where('user_id', auth()->id())
            ->where('book_id', $request->book_id)
            ->whereNull('return_date')
            ->exists()) {
            return response()->json(['message' => 'Anda sudah meminjam buku ini'], 400);
        }

        $book = Book::findOrFail($request->book_id);

        // ✅ Cek stok buku
        if ($book->stock < 1) {
            return response()->json(['message' => 'Buku sedang habis'], 400);
        }

        // ✅ Kurangi stok buku
        $book->decrement('stock');

        // ✅ Buat record peminjaman
        $borrowing = Borrowing::create([
            'user_id'     => Auth::id(),
            'book_id'     => $book->id,
            'status'      => 'borrowed',
            'borrow_date' => now(),
        ]);

        return response()->json([
            'message'   => 'Buku berhasil dipinjam',
            'borrowing' => $borrowing,
        ]);
    }

    // Kembalikan buku
    public function returnBook($id)
    {
        $borrowing = Borrowing::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        if ($borrowing->status === 'returned') {
            return response()->json(['message' => 'Buku sudah dikembalikan'], 400);
        }

        $borrowing->update([
            'status'      => 'returned',
            'return_date' => now(),
        ]);

        // ✅ Tambah stok buku lagi
        $borrowing->book->increment('stock');

        return response()->json(['message' => 'Buku berhasil dikembalikan']);
    }

    public function myBorrowings(Request $request)
    {
        $borrowings = Borrowing::with('book')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($borrowings);
    }

    // ========================
    // ADMIN SECTION
    // ========================

    // Lihat semua peminjaman (admin only)
    public function adminIndex()
    {
        $borrowings = Borrowing::with(['book', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($borrowings);
    }
}