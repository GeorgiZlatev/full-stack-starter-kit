<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Code Generation',
                'description' => 'AI tools for generating code, functions, and scripts',
                'color' => '#3B82F6',
                'icon' => 'code',
            ],
            [
                'name' => 'Text Processing',
                'description' => 'AI tools for text analysis, summarization, and processing',
                'color' => '#10B981',
                'icon' => 'text',
            ],
            [
                'name' => 'Image Generation',
                'description' => 'AI tools for creating and editing images',
                'color' => '#F59E0B',
                'icon' => 'image',
            ],
            [
                'name' => 'Data Analysis',
                'description' => 'AI tools for data processing and analysis',
                'color' => '#8B5CF6',
                'icon' => 'chart',
            ],
            [
                'name' => 'Productivity',
                'description' => 'AI tools for improving productivity and workflow',
                'color' => '#EF4444',
                'icon' => 'productivity',
            ],
            [
                'name' => 'Communication',
                'description' => 'AI tools for communication and collaboration',
                'color' => '#06B6D4',
                'icon' => 'communication',
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
