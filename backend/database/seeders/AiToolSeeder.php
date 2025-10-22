<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\AiTool;
use App\Models\Category;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AiToolSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get first user as creator
        $user = User::first();
        if (!$user) {
            $this->command->info('No users found. Please run UserSeeder first.');
            return;
        }

        // Get categories
        $codeGenCategory = Category::where('name', 'Code Generation')->first();
        $textCategory = Category::where('name', 'Text Processing')->first();
        $imageCategory = Category::where('name', 'Image Generation')->first();

        // Get tags
        $freeTag = Tag::where('name', 'Free')->first();
        $paidTag = Tag::where('name', 'Paid')->first();
        $webAppTag = Tag::where('name', 'Web App')->first();
        $apiTag = Tag::where('name', 'API')->first();

        $tools = [
            [
                'name' => 'GitHub Copilot',
                'description' => 'AI pair programmer that helps you write code faster and with fewer errors.',
                'link' => 'https://github.com/features/copilot',
                'documentation_link' => 'https://docs.github.com/en/copilot',
                'how_to_use' => 'Install the GitHub Copilot extension in your IDE and start typing. It will suggest code completions based on your context.',
                'real_examples' => 'Perfect for writing React components, API endpoints, and database queries.',
                'category_id' => $codeGenCategory->id,
                'created_by' => $user->id,
                'is_featured' => true,
                'recommended_roles' => ['backend', 'frontend'],
                'tag_ids' => [$paidTag->id, $webAppTag->id],
            ],
            [
                'name' => 'ChatGPT',
                'description' => 'Advanced AI chatbot that can help with coding, writing, and problem-solving.',
                'link' => 'https://chat.openai.com',
                'documentation_link' => 'https://platform.openai.com/docs',
                'how_to_use' => 'Simply type your question or request in the chat interface. Be specific about what you need help with.',
                'real_examples' => 'Great for debugging code, explaining concepts, and generating documentation.',
                'category_id' => $textCategory->id,
                'created_by' => $user->id,
                'is_featured' => true,
                'recommended_roles' => ['backend', 'frontend', 'pm', 'qa'],
                'tag_ids' => [$paidTag->id, $webAppTag->id],
            ],
            [
                'name' => 'DALL-E 2',
                'description' => 'AI system that can create realistic images and art from natural language descriptions.',
                'link' => 'https://openai.com/dall-e-2',
                'documentation_link' => 'https://platform.openai.com/docs/guides/images',
                'how_to_use' => 'Describe the image you want to create in detail. The more specific you are, the better the result.',
                'real_examples' => 'Perfect for creating mockups, illustrations, and visual content for projects.',
                'category_id' => $imageCategory->id,
                'created_by' => $user->id,
                'is_featured' => true,
                'recommended_roles' => ['designer', 'frontend', 'pm'],
                'tag_ids' => [$paidTag->id, $apiTag->id],
            ],
        ];

        foreach ($tools as $toolData) {
            $recommendedRoles = $toolData['recommended_roles'];
            $tagIds = $toolData['tag_ids'];
            unset($toolData['recommended_roles'], $toolData['tag_ids']);

            $tool = AiTool::create($toolData);

            // Attach roles
            foreach ($recommendedRoles as $role) {
                DB::table('ai_tool_role')->insert([
                    'ai_tool_id' => $tool->id,
                    'role' => $role,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Attach tags
            $tool->tags()->attach($tagIds);
        }
    }
}
