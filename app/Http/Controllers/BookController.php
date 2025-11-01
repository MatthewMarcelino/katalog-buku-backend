<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Book;
use Illuminate\Support\Facades\Storage;

class BookController extends Controller
{
    // GET /api/books (list semua buku)
    public function index()
    {
        $books = Book::all()->map(function ($book) {
            if ($book->cover) {
                $book->cover_url = asset('storage/' . $book->cover);
            }
            return $book;
        });

        return response()->json($books, 200);
    }

    // GET /api/books/{id} (lihat detail buku)
    public function show($id)
    {
        $book = Book::find($id);
        if (!$book) {
            return response()->json(['message' => 'Buku tidak ditemukan'], 404);
        }

        if ($book->cover) {
            $book->cover_url = asset('storage/' . $book->cover);
        }

        return response()->json($book, 200);
    }

    // POST /api/books (tambah buku) - admin only
    public function store(Request $request)
    {
        $request->validate([
            'title'     => 'required|string|max:255',
            'author'    => 'required|string|max:255',
            'publisher' => 'nullable|string|max:255',
            'year'      => 'required|integer',
            'stock'     => 'required|integer|min:0',
            'cover'     => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $data = $request->only(['title', 'author', 'publisher', 'year', 'stock']);

        if ($request->hasFile('cover')) {
            $data['cover'] = $request->file('cover')->store('covers', 'public');
        }

        $book = Book::create($data);

        if ($book->cover) {
            $book->cover_url = asset('storage/' . $book->cover);
        }

        return response()->json([
            'message' => 'Buku berhasil ditambahkan',
            'book' => $book
        ], 201);
    }

    // PUT /api/books/{id} (update buku) - admin only
    public function update(Request $request, $id)
    {
        $book = Book::find($id);
        if (!$book) {
            return response()->json(['message' => 'Buku tidak ditemukan'], 404);
        }

        $request->validate([
            'title'     => 'sometimes|required|string|max:255',
            'author'    => 'sometimes|required|string|max:255',
            'publisher' => 'nullable|string|max:255',
            'year'      => 'sometimes|required|integer',
            'stock'     => 'sometimes|required|integer|min:0',
            'cover'     => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $data = $request->only(['title', 'author', 'publisher', 'year', 'stock']);

        if ($request->hasFile('cover')) {
            // hapus cover lama kalau ada
            if ($book->cover && Storage::disk('public')->exists($book->cover)) {
                Storage::disk('public')->delete($book->cover);
            }
            $data['cover'] = $request->file('cover')->store('covers', 'public');
        }

        $book->update($data);

        if ($book->cover) {
            $book->cover_url = asset('storage/' . $book->cover);
        }

        return response()->json([
            'message' => 'Buku berhasil diupdate',
            'book' => $book
        ], 200);
    }

    // DELETE /api/books/{id} (hapus buku) - admin only
    public function destroy($id)
    {
        $book = Book::find($id);
        if (!$book) {
            return response()->json(['message' => 'Buku tidak ditemukan'], 404);
        }

        // Hapus cover jika ada
        if ($book->cover && Storage::disk('public')->exists($book->cover)) {
            Storage::disk('public')->delete($book->cover);
        }

        $book->delete();

        return response()->json([
            'message' => 'Buku berhasil dihapus',
        ], 200);
    }
}
