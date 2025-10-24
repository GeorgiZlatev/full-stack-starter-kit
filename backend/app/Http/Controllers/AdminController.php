<?php

namespace App\Http\Controllers;

use App\Models\AiTool;
use App\Models\Category;
use App\Models\Tag;
use App\Models\ActivityLog;
use App\Models\User;
use App\Models\ToolComment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Get admin dashboard statistics
     */
    public function dashboard(): JsonResponse
    {
        $stats = Cache::remember('admin_dashboard_stats', 300, function () {
            return [
                'total_tools' => AiTool::count(),
                'pending_tools' => AiTool::where('status', 'pending')->count(),
                'approved_tools' => AiTool::where('status', 'approved')->count(),
                'rejected_tools' => AiTool::where('status', 'rejected')->count(),
                'total_categories' => Category::count(),
                'total_tags' => Tag::count(),
                'total_users' => User::count(),
                'recent_activities' => ActivityLog::with('user')
                    ->latest()
                    ->limit(10)
                    ->get()
            ];
        });

        return response()->json($stats);
    }

    /**
     * Get all tools with filters and pagination
     */
    public function tools(Request $request): JsonResponse
    {
        $query = AiTool::with(['category', 'tags', 'creator', 'approvedBy']);

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('role')) {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('role', $request->role);
            });
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->has('created_by')) {
            $query->where('created_by', $request->created_by);
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $tools = $query->paginate($request->get('per_page', 15));

        return response()->json($tools);
    }

    /**
     * Approve a tool
     */
    public function approveTool(Request $request, AiTool $aiTool): JsonResponse
    {
        $request->validate([
            'reason' => 'nullable|string|max:500'
        ]);

        DB::transaction(function () use ($aiTool, $request) {
            $oldValues = $aiTool->toArray();
            
            $aiTool->update([
                'status' => 'approved',
                'approved_at' => now(),
                'approved_by' => auth()->id(),
                'rejection_reason' => null,
            ]);

            // Log activity
            ActivityLog::log(
                auth()->id(),
                'approved',
                'AiTool',
                $aiTool->id,
                $oldValues,
                $aiTool->fresh()->toArray(),
                $request->reason ?? 'Tool approved by admin',
                $request->ip(),
                $request->userAgent()
            );
        });

        Cache::forget('admin_dashboard_stats');

        return response()->json([
            'message' => 'Tool approved successfully',
            'tool' => $aiTool->fresh(['category', 'tags', 'creator', 'approvedBy'])
        ]);
    }

    /**
     * Reject a tool
     */
    public function rejectTool(Request $request, AiTool $aiTool): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|max:500'
        ]);

        DB::transaction(function () use ($aiTool, $request) {
            $oldValues = $aiTool->toArray();
            
            $aiTool->update([
                'status' => 'rejected',
                'rejection_reason' => $request->reason,
                'approved_at' => null,
                'approved_by' => null,
            ]);

            // Log activity
            ActivityLog::log(
                auth()->id(),
                'rejected',
                'AiTool',
                $aiTool->id,
                $oldValues,
                $aiTool->fresh()->toArray(),
                "Tool rejected: {$request->reason}",
                $request->ip(),
                $request->userAgent()
            );
        });

        Cache::forget('admin_dashboard_stats');

        return response()->json([
            'message' => 'Tool rejected successfully',
            'tool' => $aiTool->fresh(['category', 'tags', 'creator'])
        ]);
    }

    /**
     * Get activity logs
     */
    public function activityLogs(Request $request): JsonResponse
    {
        $query = ActivityLog::with('user');

        // Apply filters
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('action')) {
            $query->where('action', $request->action);
        }

        if ($request->has('model_type')) {
            $query->where('model_type', $request->model_type);
        }

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $logs = $query->latest()->paginate($request->get('per_page', 20));

        return response()->json($logs);
    }

    /**
     * Get users list for admin
     */
    public function users(Request $request): JsonResponse
    {
        $query = User::withCount(['aiTools as tools_count']);

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        $users = $query->paginate($request->get('per_page', 15));

        return response()->json($users);
    }

    /**
     * Get categories with tool counts
     */
    public function categories(): JsonResponse
    {
        $categories = Cache::remember('admin_categories', 300, function () {
            return Category::withCount('aiTools')->get();
        });

        return response()->json($categories);
    }

    /**
     * Get tags with tool counts
     */
    public function tags(): JsonResponse
    {
        $tags = Cache::remember('admin_tags', 300, function () {
            return Tag::withCount('aiTools')->get();
        });

        return response()->json($tags);
    }

    /**
     * Get all comments for admin review
     */
    public function comments(): JsonResponse
    {
        $comments = ToolComment::with(['user', 'aiTool'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($comments);
    }

    /**
     * Clear cache
     */
    public function clearCache(): JsonResponse
    {
        Cache::forget('admin_dashboard_stats');
        Cache::forget('admin_categories');
        Cache::forget('admin_tags');
        
        return response()->json(['message' => 'Cache cleared successfully']);
    }
}