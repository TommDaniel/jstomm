<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Radio>
 */
class RadioFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->company().' FM',
            'stream_url' => 'https://stream.example.com/'.fake()->slug().'/stream',
            'logo_url' => null,
            'genre' => fake()->randomElement(['sertanejo', 'gaúcha', 'pop', 'rock', null]),
            'is_favorite' => false,
            'order' => fake()->numberBetween(0, 100),
        ];
    }
}
