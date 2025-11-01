<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Book;
use App\Models\Borrowing;

class AdminSeeder extends Seeder
{
    public function run()
    {
        // Buat user admin
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password123'),
            'role' => 'admin'
        ]);

        // Buat beberapa buku
        Book::create([
            'title' => 'Psikologi Uang',
            'author' => 'Morgan Housel',
            'publisher' => 'Penerbit A',
            'year' => 2023,
            'stock' => 10,
            'cover' => 'covers/book1.jpg'
        ]);

        // Buat peminjaman
        Borrowing::create([
            'user_id' => $admin->id,
            'book_id' => 1,
            'status' => 'borrowed',
            'borrow_date' => now(),
            'return_date' => null
        ]);
    }
}