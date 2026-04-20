<?php

namespace Database\Factories;

use App\Models\Trip;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TripPoint>
 */
class TripPointFactory extends Factory
{
    public function definition(): array
    {
        return [
            'trip_id' => Trip::factory(),
            'name' => fake()->city(),
            'latitude' => fake()->latitude(-33, -27),
            'longitude' => fake()->longitude(-57, -48),
            'order' => fake()->numberBetween(1, 20),
            'km_from_previous' => fake()->numberBetween(0, 500),
            'arrival_date' => fake()->optional()->date(),
            'description' => fake()->optional()->sentence(),
            'is_car_route' => fake()->boolean(),
            'is_hub' => false,
        ];
    }
}
