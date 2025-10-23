<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class TwoFactorCode extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'code',
        'expires_at',
        'is_used',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_used' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isValid(): bool
    {
        return !$this->is_used && !$this->isExpired();
    }

    public function markAsUsed(): void
    {
        $this->is_used = true;
        $this->save();
    }

    public static function generateCode(int $userId, string $type, int $expiryMinutes = 10): self
    {
        // Clean up old codes for this user and type
        self::where('user_id', $userId)
            ->where('type', $type)
            ->where('expires_at', '<', now())
            ->delete();

        return self::create([
            'user_id' => $userId,
            'type' => $type,
            'code' => str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT),
            'expires_at' => now()->addMinutes($expiryMinutes),
        ]);
    }
}
