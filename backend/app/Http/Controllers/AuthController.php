<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use App\Services\TwoFactorService;

class AuthController extends Controller
{
    private TwoFactorService $twoFactorService;

    public function __construct(TwoFactorService $twoFactorService)
    {
        $this->twoFactorService = $twoFactorService;
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'two_factor_code' => 'nullable|string',
        ]);

        if (Auth::attempt($request->only('email', 'password'))) {
            $user = Auth::user();
            
            // Check if user has 2FA enabled
            if ($this->twoFactorService->hasTwoFactorEnabled($user)) {
                // If 2FA code is provided, verify it
                if ($request->has('two_factor_code')) {
                    $twoFactorCode = $request->two_factor_code;
                    $twoFactorType = $request->get('two_factor_type', 'google_authenticator');
                    
                    if ($this->twoFactorService->verifyCode($user, $twoFactorCode, $twoFactorType)) {
                        // 2FA verified, proceed with login
                        $token = $user->createToken('auth-token')->plainTextToken;
                        
                        return response()->json([
                            'user' => $user,
                            'token' => $token,
                            'message' => 'Login successful'
                        ]);
                    } else {
                        throw ValidationException::withMessages([
                            'two_factor_code' => ['Invalid 2FA code.'],
                        ]);
                    }
                } else {
                    // 2FA is enabled but no code provided
                    return response()->json([
                        'requires_2fa' => true,
                        'message' => '2FA code required',
                        'available_methods' => $this->twoFactorService->getUserTwoFactorMethods($user),
                    ], 200);
                }
            } else {
                // No 2FA enabled, proceed with normal login
                $token = $user->createToken('auth-token')->plainTextToken;

                return response()->json([
                    'user' => $user,
                    'token' => $token,
                    'message' => 'Login successful'
                ]);
            }
        }

        throw ValidationException::withMessages([
            'email' => ['The provided credentials are incorrect.'],
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:owner,admin,backend,frontend,pm,qa,designer',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'Registration successful'
        ], 201);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout successful'
        ]);
    }

    public function user(Request $request)
    {
        return response()->json([
            'user' => $request->user()
        ]);
    }
}
