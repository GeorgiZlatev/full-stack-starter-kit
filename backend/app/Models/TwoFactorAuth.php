<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class TwoFactorAuth extends Model
{
    protected $fillable = [
        'user_id',
        'type', // 'email', 'telegram', 'google_authenticator'
        'secret', // For Google Authenticator
        'telegram_chat_id', // For Telegram
        'is_enabled',
        'backup_codes',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'backup_codes' => 'array',
    ];

    protected $hidden = [
        'secret',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function generateBackupCodes(): array
    {
        $codes = [];
        for ($i = 0; $i < 8; $i++) {
            $codes[] = Str::random(8);
        }
        
        $this->backup_codes = $codes;
        $this->save();
        
        return $codes;
    }

    public function verifyBackupCode(string $code): bool
    {
        if (!$this->backup_codes) {
            return false;
        }

        $index = array_search($code, $this->backup_codes);
        if ($index !== false) {
            // Remove used backup code
            unset($this->backup_codes[$index]);
            $this->backup_codes = array_values($this->backup_codes);
            $this->save();
            return true;
        }

        return false;
    }
}
