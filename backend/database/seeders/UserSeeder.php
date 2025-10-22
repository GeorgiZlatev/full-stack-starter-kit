<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Owner User',
                'email' => 'owner@example.com',
                'password' => Hash::make('password'),
                'role' => 'owner',
            ],
            [
                'name' => 'Backend Developer',
                'email' => 'backend@example.com',
                'password' => Hash::make('password'),
                'role' => 'backend',
            ],
            [
                'name' => 'Frontend Developer',
                'email' => 'frontend@example.com',
                'password' => Hash::make('password'),
                'role' => 'frontend',
            ],
            [
                'name' => 'Project Manager',
                'email' => 'pm@example.com',
                'password' => Hash::make('password'),
                'role' => 'pm',
            ],
            [
                'name' => 'QA Tester',
                'email' => 'qa@example.com',
                'password' => Hash::make('password'),
                'role' => 'qa',
            ],
            [
                'name' => 'UI/UX Designer',
                'email' => 'designer@example.com',
                'password' => Hash::make('password'),
                'role' => 'designer',
            ],
        ];

        foreach ($users as $userData) {
            User::create($userData);
        }
    }
}
