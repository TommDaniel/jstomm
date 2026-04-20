<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Photo extends Model
{
    use HasFactory;
    protected $fillable = ['album_id', 'path', 'thumbnail_path', 'caption', 'taken_at', 'width', 'height', 'metadata'];

    protected $casts = [
        'metadata' => 'array',
        'taken_at' => 'date',
    ];

    public function album(): BelongsTo
    {
        return $this->belongsTo(Album::class);
    }
}
