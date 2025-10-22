<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class AiTool extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'how_to_use',
        'real_examples',
        'link',
        'documentation_link',
        'screenshots',
        'additional_requirements',
        'category_id',
        'created_by',
        'is_active',
        'is_featured',
        'views_count',
    ];

    protected $casts = [
        'screenshots' => 'array',
        'additional_requirements' => 'array',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($tool) {
            if (empty($tool->slug)) {
                $tool->slug = Str::slug($tool->name);
            }
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'ai_tool_role', 'ai_tool_id', 'role');
    }

    public function getRecommendedRolesAttribute()
    {
        return $this->roles()->pluck('role')->toArray();
    }
}
