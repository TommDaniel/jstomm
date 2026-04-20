<?php

namespace Database\Factories;

use App\Models\Album;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Photo>
 */
class PhotoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'album_id' => Album::factory(),
            'path' => 'photos/'.fake()->uuid().'.jpg',
            'thumbnail_path' => null,
            'caption' => fake()->optional()->sentence(),
            'taken_at' => fake()->optional()->date(),
            'width' => fake()->numberBetween(800, 4000),
            'height' => fake()->numberBetween(600, 3000),
            'metadata' => null,
        ];
    }
}
