<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Book;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::firstOrCreate(
            ['email' => 'admin@bookverse.com'],
            [
                'name' => 'Admin BookVerse',
                'password' => Hash::make('password123'),
                'role' => 'admin',
            ]
        );

        // User
        User::firstOrCreate(
            ['email' => 'user@bookverse.com'],
            [
                'name' => 'User Biasa',
                'password' => Hash::make('password123'),
                'role' => 'user',
            ]
        );

        // Books
        Book::firstOrCreate(
            ['title' => 'Clean Code'],
            ['author' => 'Robert C. Martin', 'year' => 2008, 'stock' => 5]
        );

        Book::firstOrCreate(
            ['title' => 'Laravel Up & Running'],
            ['author' => 'Matt Stauffer', 'year' => 2019, 'stock' => 3]
        );

        Book::firstOrCreate(
            ['title' => 'JavaScript: The Good Parts'],
            ['author' => 'Douglas Crockford', 'year' => 2008, 'stock' => 4]
        );
    }
}
