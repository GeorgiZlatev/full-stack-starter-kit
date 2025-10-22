<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Tag;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tags = [
            ['name' => 'Free', 'color' => '#10B981'],
            ['name' => 'Paid', 'color' => '#F59E0B'],
            ['name' => 'Open Source', 'color' => '#3B82F6'],
            ['name' => 'API', 'color' => '#8B5CF6'],
            ['name' => 'Web App', 'color' => '#EF4444'],
            ['name' => 'Desktop', 'color' => '#06B6D4'],
            ['name' => 'Mobile', 'color' => '#84CC16'],
            ['name' => 'Cloud', 'color' => '#F97316'],
            ['name' => 'Local', 'color' => '#6B7280'],
            ['name' => 'Beginner', 'color' => '#10B981'],
            ['name' => 'Advanced', 'color' => '#EF4444'],
            ['name' => 'Enterprise', 'color' => '#8B5CF6'],
        ];

        foreach ($tags as $tag) {
            Tag::create($tag);
        }
    }
}
