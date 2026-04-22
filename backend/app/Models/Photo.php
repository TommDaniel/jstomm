<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Photo extends Model
{
    use HasFactory;
    protected $fillable = [
        'album_id', 'path', 'thumbnail_path', 'caption', 'taken_at',
        'width', 'height', 'metadata',
        'category', 'category_confidence', 'classified_at', 'phash',
    ];

    protected $casts = [
        'metadata' => 'array',
        'taken_at' => 'date',
        'classified_at' => 'datetime',
        'category_confidence' => 'float',
    ];

    public function album(): BelongsTo
    {
        return $this->belongsTo(Album::class);
    }
}
