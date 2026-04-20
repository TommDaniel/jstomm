<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TripPoint extends Model
{
    use HasFactory;
    protected $fillable = [
        'trip_id', 'name', 'latitude', 'longitude', 'order',
        'km_from_previous', 'arrival_date', 'description', 'photo_id',
        'is_car_route', 'is_hub',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'order' => 'integer',
        'km_from_previous' => 'integer',
        'is_car_route' => 'boolean',
        'is_hub' => 'boolean',
    ];

    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }
}
