<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\TwoFactorService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class TwoFactorController extends Controller
{
    private TwoFactorService $twoFactorService;

    public function __construct(TwoFactorService $twoFactorService)
    {
        $this->twoFactorService = $twoFactorService;
    }

    /**
     * Get user's 2FA status
     */
    public function status(): JsonResponse
    {
        $user = Auth::user();
        $methods = $this->twoFactorService->getUserTwoFactorMethods($user);

        return response()->json([
            'enabled_methods' => $methods,
            'has_any_enabled' => count($methods) > 0,
        ]);
    }

    /**
     * Enable 2FA for a specific method
     */
    public function enable(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:email,telegram,google_authenticator',
            'telegram_chat_id' => 'required_if:type,telegram|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = Auth::user();
        $type = $request->type;
        $data = [];

        // Handle different 2FA types
        switch ($type) {
            case 'email':
                // Email 2FA is straightforward
                break;

            case 'telegram':
                $data['telegram_chat_id'] = $request->telegram_chat_id;
                break;

            case 'google_authenticator':
                $googleAuthData = $this->twoFactorService->generateGoogleAuthSecret($user);
                $data['secret'] = $googleAuthData['secret'];
                
                // Enable 2FA first
                $twoFactorAuth = $this->twoFactorService->enableTwoFactor($user, $type, $data);
                
                // Return QR code URL for frontend
                return response()->json([
                    'message' => 'Google Authenticator setup initiated',
                    'qr_code_url' => $googleAuthData['qr_code_url'],
                    'secret' => $googleAuthData['secret'],
                    'backup_codes' => $twoFactorAuth->backup_codes,
                ]);
        }

        $twoFactorAuth = $this->twoFactorService->enableTwoFactor($user, $type, $data);

        return response()->json([
            'message' => '2FA enabled successfully',
            'backup_codes' => $twoFactorAuth->backup_codes,
        ]);
    }

    /**
     * Disable 2FA for a specific method
     */
    public function disable(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:email,telegram,google_authenticator',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = Auth::user();
        $success = $this->twoFactorService->disableTwoFactor($user, $request->type);

        if ($success) {
            return response()->json(['message' => '2FA disabled successfully']);
        }

        return response()->json(['message' => '2FA was not enabled for this method'], 400);
    }

    /**
     * Send verification code
     */
    public function sendCode(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:email,telegram',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = Auth::user();
        $type = $request->type;

        try {
            switch ($type) {
                case 'email':
                    $this->twoFactorService->sendEmailCode($user);
                    break;
                case 'telegram':
                    $validator = Validator::make($request->all(), [
                        'telegram_chat_id' => 'required|string',
                    ]);
                    
                    if ($validator->fails()) {
                        return response()->json(['errors' => $validator->errors()], 422);
                    }
                    
                    $this->twoFactorService->sendTelegramCode($user, $request->telegram_chat_id);
                    break;
            }

            return response()->json(['message' => 'Verification code sent successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to send verification code'], 500);
        }
    }

    /**
     * Verify 2FA code
     */
    public function verify(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string',
            'type' => 'required|in:email,telegram,google_authenticator',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = Auth::user();
        $isValid = $this->twoFactorService->verifyCode($user, $request->code, $request->type);

        if ($isValid) {
            return response()->json(['message' => 'Code verified successfully']);
        }

        return response()->json(['message' => 'Invalid or expired code'], 400);
    }

    /**
     * Generate new backup codes
     */
    public function generateBackupCodes(): JsonResponse
    {
        $user = Auth::user();
        $twoFactorAuth = $user->twoFactorAuths()->where('is_enabled', true)->first();

        if (!$twoFactorAuth) {
            return response()->json(['message' => 'No 2FA enabled'], 400);
        }

        $backupCodes = $twoFactorAuth->generateBackupCodes();

        return response()->json([
            'message' => 'New backup codes generated',
            'backup_codes' => $backupCodes,
        ]);
    }
}
