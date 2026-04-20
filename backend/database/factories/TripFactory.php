<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Trip>
 */
class TripFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->city().' '.fake()->year(),
            'year' => fake()->numberBetween(1970, 2024),
            'description' => fake()->sentence(),
            'total_km' => fake()->numberBetween(0, 5000),
            'category' => fake()->randomElement(['rs', 'brasil', 'internacional']),
        ];
    }
}
