<?php

namespace App\Services;

use App\Models\User;
use App\Models\TwoFactorAuth;
use App\Models\TwoFactorCode;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Http;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorService
{
    private Google2FA $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
    }

    /**
     * Enable 2FA for a user
     */
    public function enableTwoFactor(User $user, string $type, array $data = []): TwoFactorAuth
    {
        $twoFactorAuth = TwoFactorAuth::updateOrCreate(
            ['user_id' => $user->id, 'type' => $type],
            [
                'is_enabled' => true,
                'secret' => $data['secret'] ?? null,
                'telegram_chat_id' => $data['telegram_chat_id'] ?? null,
            ]
        );

        // Generate backup codes
        $twoFactorAuth->generateBackupCodes();

        return $twoFactorAuth;
    }

    /**
     * Disable 2FA for a user
     */
    public function disableTwoFactor(User $user, string $type): bool
    {
        return TwoFactorAuth::where('user_id', $user->id)
            ->where('type', $type)
            ->delete() > 0;
    }

    /**
     * Send verification code via email
     */
    public function sendEmailCode(User $user): TwoFactorCode
    {
        $code = TwoFactorCode::generateCode($user->id, 'email');
        
        Mail::send('emails.two-factor-code', [
            'user' => $user,
            'code' => $code->code,
        ], function ($message) use ($user) {
            $message->to($user->email)
                   ->subject('Your 2FA Verification Code');
        });

        return $code;
    }

    /**
     * Send verification code via Telegram
     */
    public function sendTelegramCode(User $user, string $chatId): TwoFactorCode
    {
        $code = TwoFactorCode::generateCode($user->id, 'telegram');
        
        $botToken = config('services.telegram.bot_token');
        $message = "Your 2FA verification code: {$code->code}\n\nThis code expires in 10 minutes.";
        
        Http::post("https://api.telegram.org/bot{$botToken}/sendMessage", [
            'chat_id' => $chatId,
            'text' => $message,
        ]);

        return $code;
    }

    /**
     * Generate Google Authenticator secret
     */
    public function generateGoogleAuthSecret(User $user): array
    {
        $secret = $this->google2fa->generateSecretKey();
        $qrCodeUrl = $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );

        return [
            'secret' => $secret,
            'qr_code_url' => $qrCodeUrl,
        ];
    }

    /**
     * Verify Google Authenticator code
     */
    public function verifyGoogleAuthCode(User $user, string $code): bool
    {
        $twoFactorAuth = TwoFactorAuth::where('user_id', $user->id)
            ->where('type', 'google_authenticator')
            ->where('is_enabled', true)
            ->first();

        if (!$twoFactorAuth || !$twoFactorAuth->secret) {
            return false;
        }

        return $this->google2fa->verifyKey($twoFactorAuth->secret, $code);
    }

    /**
     * Verify any 2FA code
     */
    public function verifyCode(User $user, string $code, string $type): bool
    {
        // Check if it's a backup code
        $twoFactorAuth = TwoFactorAuth::where('user_id', $user->id)
            ->where('type', $type)
            ->where('is_enabled', true)
            ->first();

        if ($twoFactorAuth && $twoFactorAuth->verifyBackupCode($code)) {
            return true;
        }

        // Check temporary codes
        $twoFactorCode = TwoFactorCode::where('user_id', $user->id)
            ->where('type', $type)
            ->where('code', $code)
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->first();

        if ($twoFactorCode) {
            $twoFactorCode->markAsUsed();
            return true;
        }

        // For Google Authenticator
        if ($type === 'google_authenticator') {
            return $this->verifyGoogleAuthCode($user, $code);
        }

        return false;
    }

    /**
     * Check if user has 2FA enabled
     */
    public function hasTwoFactorEnabled(User $user, string $type = null): bool
    {
        $query = TwoFactorAuth::where('user_id', $user->id)
            ->where('is_enabled', true);

        if ($type) {
            $query->where('type', $type);
        }

        return $query->exists();
    }

    /**
     * Get user's 2FA methods
     */
    public function getUserTwoFactorMethods(User $user): array
    {
        return TwoFactorAuth::where('user_id', $user->id)
            ->where('is_enabled', true)
            ->pluck('type')
            ->toArray();
    }
}
