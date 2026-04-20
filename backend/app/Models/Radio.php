<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Radio extends Model
{
    protected $fillable = ['user_id', 'name', 'stream_url', 'logo_url', 'genre', 'is_favorite', 'order'];

    protected $casts = [
        'is_favorite' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
