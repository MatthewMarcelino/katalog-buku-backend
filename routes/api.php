<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\BorrowingController;
use App\Models\Book;
use App\Models\Borrowing;
use App\Models\User;

// Default route (cek user login)
// ✅ Sudah benar, hanya perlu 1
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return response()->json($request->user());
});

// AUTH
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

// BOOKS
Route::get('/books', [BookController::class, 'index']);
Route::get('/books/{id}', [BookController::class, 'show']);

// Admin only CRUD
Route::middleware(['auth:sanctum','admin'])->group(function() {
    Route::post('/books', [BookController::class, 'store']);
    Route::put('/books/{id}', [BookController::class, 'update']);
    Route::delete('/books/{id}', [BookController::class, 'destroy']);
});

// BORROWINGS (user hanya lihat pinjaman sendiri + pinjam/kembali)
Route::middleware('auth:sanctum')->group(function(){
    Route::get('/borrowings', [BorrowingController::class,'index']);
    Route::post('/borrowings', [BorrowingController::class,'store']);
    Route::put('/borrowings/{id}/return', [BorrowingController::class,'returnBook']);

    // ✅ tambahan → user bisa lihat daftar pinjaman sendiri
    Route::get('/my-borrowings', [BorrowingController::class,'myBorrowings']);
});

// ✅ tambahan → admin lihat semua peminjaman
Route::middleware(['auth:sanctum','admin'])->group(function(){
    Route::get('/borrowings/all', [BorrowingController::class,'adminIndex']);
});

// ✅ Dashboard summary untuk admin
Route::middleware('auth:sanctum')->get('/dashboard-summary', function (Request $request) {
    return response()->json([
        'total_books' => Book::count(),
        'total_borrowed' => Borrowing::whereNull('return_date')->count(),
        'total_users' => User::count(),
    ]);
});

// ✅ CSRF token untuk Sanctum
Route::get('/sanctum/csrf-cookie', function () {
    return response()->json(['message' => 'CSRF cookie set']);
})->middleware('web');