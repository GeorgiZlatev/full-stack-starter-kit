<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AiTool;
use App\Models\Category;
use App\Models\Tag;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AiToolController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = AiTool::with(['category', 'tags', 'creator', 'ratings'])
            ->where('is_active', true);

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by role
        if ($request->has('role')) {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('role', $request->role);
            });
        }

        // Filter by tag
        if ($request->has('tag_id')) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('tag_id', $request->tag_id);
            });
        }

        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Featured tools first
        if ($request->has('featured')) {
            $query->where('is_featured', true);
        }

        $tools = $query->orderBy('is_featured', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(12);

        return response()->json($tools);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'link' => 'required|url',
            'category_id' => 'required|exists:categories,id',
            'recommended_roles' => 'array',
            'recommended_roles.*' => 'in:owner,backend,frontend,pm,qa,designer',
            'tag_ids' => 'array',
            'tag_ids.*' => 'exists:tags,id',
            'how_to_use' => 'nullable|string',
            'real_examples' => 'nullable|string',
            'documentation_link' => 'nullable|url',
            'screenshots' => 'nullable|array',
            'additional_requirements' => 'nullable|array',
        ]);

        DB::beginTransaction();
        try {
            $tool = AiTool::create([
                'name' => $request->name,
                'description' => $request->description,
                'link' => $request->link,
                'category_id' => $request->category_id,
                'created_by' => Auth::id(),
                'how_to_use' => $request->how_to_use,
                'real_examples' => $request->real_examples,
                'documentation_link' => $request->documentation_link,
                'screenshots' => $request->screenshots,
                'additional_requirements' => $request->additional_requirements,
            ]);

            // Attach roles
            if ($request->has('recommended_roles')) {
                foreach ($request->recommended_roles as $role) {
                    DB::table('ai_tool_role')->insert([
                        'ai_tool_id' => $tool->id,
                        'role' => $role,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            // Attach tags
            if ($request->has('tag_ids')) {
                $tool->tags()->attach($request->tag_ids);
            }

            // Log activity
            ActivityLog::log(
                Auth::id(),
                'create',
                'AiTool',
                $tool->id,
                null,
                $tool->toArray(),
                "Created new AI tool: {$tool->name}",
                $request->ip(),
                $request->userAgent()
            );

            DB::commit();

            return response()->json([
                'message' => 'AI Tool created successfully',
                'tool' => $tool->load(['category', 'tags'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Error creating AI Tool',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(AiTool $aiTool)
    {
        // Increment view count
        $aiTool->increment('views_count');

        return response()->json($aiTool->load(['category', 'tags', 'creator', 'ratings', 'comments']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AiTool $aiTool)
    {
        // Check if user can update this tool
        if ($aiTool->created_by !== Auth::id() && !Auth::user()->hasRole('owner')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'link' => 'sometimes|url',
            'category_id' => 'sometimes|exists:categories,id',
            'recommended_roles' => 'sometimes|array',
            'recommended_roles.*' => 'in:owner,backend,frontend,pm,qa,designer',
            'tag_ids' => 'sometimes|array',
            'tag_ids.*' => 'exists:tags,id',
            'how_to_use' => 'nullable|string',
            'real_examples' => 'nullable|string',
            'documentation_link' => 'nullable|url',
            'screenshots' => 'nullable|array',
            'additional_requirements' => 'nullable|array',
        ]);

        DB::beginTransaction();
        try {
            $oldValues = $aiTool->toArray();
            
            $aiTool->update($request->only([
                'name', 'description', 'link', 'category_id',
                'how_to_use', 'real_examples', 'documentation_link',
                'screenshots', 'additional_requirements'
            ]));

            // Update roles
            if ($request->has('recommended_roles')) {
                DB::table('ai_tool_role')->where('ai_tool_id', $aiTool->id)->delete();
                foreach ($request->recommended_roles as $role) {
                    DB::table('ai_tool_role')->insert([
                        'ai_tool_id' => $aiTool->id,
                        'role' => $role,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            // Update tags
            if ($request->has('tag_ids')) {
                $aiTool->tags()->sync($request->tag_ids);
            }

            // Log activity
            ActivityLog::log(
                Auth::id(),
                'update',
                'AiTool',
                $aiTool->id,
                $oldValues,
                $aiTool->fresh()->toArray(),
                "Updated AI tool: {$aiTool->name}",
                $request->ip(),
                $request->userAgent()
            );

            DB::commit();

            return response()->json([
                'message' => 'AI Tool updated successfully',
                'tool' => $aiTool->load(['category', 'tags'])
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Error updating AI Tool',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AiTool $aiTool)
    {
        // Check if user can delete this tool
        if ($aiTool->created_by !== Auth::id() && !Auth::user()->hasRole('owner')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $oldValues = $aiTool->toArray();
        $toolName = $aiTool->name;
        
        // Log activity before deletion
        ActivityLog::log(
            Auth::id(),
            'delete',
            'AiTool',
            $aiTool->id,
            $oldValues,
            null,
            "Deleted AI tool: {$toolName}",
            request()->ip(),
            request()->userAgent()
        );

        $aiTool->delete();

        return response()->json(['message' => 'AI Tool deleted successfully']);
    }
}
