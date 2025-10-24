<?php

namespace App\Http\Controllers;

use App\Models\ToolRating;
use App\Models\AiTool;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ToolRatingController extends Controller
{
    /**
     * Get ratings for a tool
     */
    public function index(Request $request, AiTool $aiTool): JsonResponse
    {
        $ratings = $aiTool->ratings()
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $averageRating = $aiTool->average_rating;
        $ratingsCount = $aiTool->ratings_count;

        return response()->json([
            'ratings' => $ratings,
            'average_rating' => round($averageRating, 1),
            'ratings_count' => $ratingsCount,
        ]);
    }

    /**
     * Store or update a rating
     */
    public function store(Request $request, AiTool $aiTool): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $rating = ToolRating::updateOrCreate(
            [
                'ai_tool_id' => $aiTool->id,
                'user_id' => Auth::id(),
            ],
            [
                'rating' => $request->rating,
            ]
        );

        // Get updated stats
        $averageRating = $aiTool->fresh()->average_rating;
        $ratingsCount = $aiTool->fresh()->ratings_count;

        return response()->json([
            'message' => 'Rating saved successfully',
            'rating' => $rating,
            'average_rating' => round($averageRating, 1),
            'ratings_count' => $ratingsCount,
        ], 201);
    }

    /**
     * Get user's rating for a tool
     */
    public function show(Request $request, AiTool $aiTool): JsonResponse
    {
        $rating = ToolRating::where('ai_tool_id', $aiTool->id)
            ->where('user_id', Auth::id())
            ->first();

        return response()->json([
            'rating' => $rating,
            'average_rating' => round($aiTool->average_rating, 1),
            'ratings_count' => $aiTool->ratings_count,
        ]);
    }

    /**
     * Delete user's rating
     */
    public function destroy(Request $request, AiTool $aiTool): JsonResponse
    {
        $rating = ToolRating::where('ai_tool_id', $aiTool->id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$rating) {
            return response()->json(['message' => 'Rating not found'], 404);
        }

        $rating->delete();

        // Get updated stats
        $averageRating = $aiTool->fresh()->average_rating;
        $ratingsCount = $aiTool->fresh()->ratings_count;

        return response()->json([
            'message' => 'Rating deleted successfully',
            'average_rating' => round($averageRating, 1),
            'ratings_count' => $ratingsCount,
        ]);
    }
}