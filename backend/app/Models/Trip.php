<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Trip extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'year', 'description', 'total_km', 'category'];

    public function points(): HasMany
    {
        return $this->hasMany(TripPoint::class)->orderBy('order');
    }
}
