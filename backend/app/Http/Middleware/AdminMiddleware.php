<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $user = auth()->user();
        
        // Check if user has admin role (owner or specific admin roles)
        $adminRoles = ['owner', 'admin'];
        
        if (!in_array($user->role, $adminRoles)) {
            return response()->json([
                'message' => 'Access denied. Admin privileges required.',
                'required_roles' => $adminRoles,
                'user_role' => $user->role
            ], 403);
        }

        return $next($request);
    }
}
