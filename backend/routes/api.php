<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AiToolController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\TwoFactorController;
use App\Http\Controllers\AdminController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Public AI Tools routes (read-only)
Route::get('/ai-tools', [AiToolController::class, 'index']);
Route::get('/ai-tools/{aiTool}', [AiToolController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/tags', [TagController::class, 'index']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
    
    // AI Tools management (authenticated users only)
    Route::post('/ai-tools', [AiToolController::class, 'store']);
    Route::put('/ai-tools/{aiTool}', [AiToolController::class, 'update']);
    Route::delete('/ai-tools/{aiTool}', [AiToolController::class, 'destroy']);
    
    // Categories management (authenticated users only)
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::get('/categories/{category}', [CategoryController::class, 'show']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
    
        // Tags management (authenticated users only)
        Route::post('/tags', [TagController::class, 'store']);
        Route::get('/tags/{tag}', [TagController::class, 'show']);
        Route::put('/tags/{tag}', [TagController::class, 'update']);
        Route::delete('/tags/{tag}', [TagController::class, 'destroy']);
        
        // 2FA management (authenticated users only)
        Route::prefix('2fa')->group(function () {
            Route::get('/status', [TwoFactorController::class, 'status']);
            Route::post('/enable', [TwoFactorController::class, 'enable']);
            Route::post('/disable', [TwoFactorController::class, 'disable']);
            Route::post('/send-code', [TwoFactorController::class, 'sendCode']);
            Route::post('/verify', [TwoFactorController::class, 'verify']);
            Route::post('/backup-codes', [TwoFactorController::class, 'generateBackupCodes']);
        });

        // Admin routes (admin middleware required)
        Route::middleware('admin')->prefix('admin')->group(function () {
            Route::get('/dashboard', [AdminController::class, 'dashboard']);
            Route::get('/tools', [AdminController::class, 'tools']);
            Route::post('/tools/{aiTool}/approve', [AdminController::class, 'approveTool']);
            Route::post('/tools/{aiTool}/reject', [AdminController::class, 'rejectTool']);
            Route::get('/activity-logs', [AdminController::class, 'activityLogs']);
            Route::get('/users', [AdminController::class, 'users']);
            Route::get('/categories', [AdminController::class, 'categories']);
            Route::get('/tags', [AdminController::class, 'tags']);
            Route::post('/clear-cache', [AdminController::class, 'clearCache']);
        });
    });
