<?php

namespace App\Http\Controllers;

use App\Models\ToolComment;
use App\Models\AiTool;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ToolCommentController extends Controller
{
    /**
     * Get comments for a tool
     */
    public function index(Request $request, AiTool $aiTool): JsonResponse
    {
        $comments = $aiTool->comments()
            ->with('user')
            ->where('is_approved', true)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($comments);
    }

    /**
     * Store a new comment
     */
    public function store(Request $request, AiTool $aiTool): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:1000|min:10',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $comment = ToolComment::create([
            'ai_tool_id' => $aiTool->id,
            'user_id' => Auth::id(),
            'content' => $request->content,
            'is_approved' => false, // Requires admin approval
        ]);

        return response()->json([
            'message' => 'Comment submitted successfully. It will be reviewed before being published.',
            'comment' => $comment->load('user')
        ], 201);
    }

    /**
     * Update a comment (only by owner or admin)
     */
    public function update(Request $request, ToolComment $comment): JsonResponse
    {
        $user = Auth::user();
        
        // Check if user can update this comment
        if ($comment->user_id !== $user->id && !in_array($user->role, ['owner', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:1000|min:10',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $comment->update([
            'content' => $request->content,
            'is_approved' => false, // Re-approval needed after edit
        ]);

        return response()->json([
            'message' => 'Comment updated successfully',
            'comment' => $comment->load('user')
        ]);
    }

    /**
     * Delete a comment (only by owner or admin)
     */
    public function destroy(ToolComment $comment): JsonResponse
    {
        $user = Auth::user();
        
        // Check if user can delete this comment
        if ($comment->user_id !== $user->id && !in_array($user->role, ['owner', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted successfully']);
    }

    /**
     * Approve a comment (admin only)
     */
    public function approve(ToolComment $comment): JsonResponse
    {
        $user = Auth::user();
        
        if (!in_array($user->role, ['owner', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->update(['is_approved' => true]);

        return response()->json([
            'message' => 'Comment approved successfully',
            'comment' => $comment->load('user')
        ]);
    }

    /**
     * Reject a comment (admin only)
     */
    public function reject(ToolComment $comment): JsonResponse
    {
        $user = Auth::user();
        
        if (!in_array($user->role, ['owner', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comment rejected and deleted']);
    }
}