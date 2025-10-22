<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tag;

class TagController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tags = Tag::where('is_active', true)
            ->withCount('aiTools')
            ->orderBy('name')
            ->get();

        return response()->json($tags);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        $tag = Tag::create($request->all());

        return response()->json([
            'message' => 'Tag created successfully',
            'tag' => $tag
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Tag $tag)
    {
        return response()->json($tag->loadCount('aiTools'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Tag $tag)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'is_active' => 'sometimes|boolean',
        ]);

        $tag->update($request->all());

        return response()->json([
            'message' => 'Tag updated successfully',
            'tag' => $tag
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tag $tag)
    {
        $tag->delete();

        return response()->json(['message' => 'Tag deleted successfully']);
    }
}
