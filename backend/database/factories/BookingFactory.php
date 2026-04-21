<?php

namespace Database\Factories;

use App\Models\Apartment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Booking>
 */
class BookingFactory extends Factory
{
    public function definition(): array
    {
        $checkIn = fake()->dateTimeBetween('-30 days', '+30 days');

        return [
            'apartment_id' => Apartment::factory(),
            'tenant_name' => fake()->name(),
            'tenant_contact' => fake()->phoneNumber(),
            'check_in' => $checkIn,
            'check_out' => (clone $checkIn)->modify('+30 days'),
            'rental_type' => fake()->randomElement(['diaria', 'semanal', 'mensal', 'anual']),
            'platform' => fake()->randomElement(['direto', 'airbnb']),
            'price_per_period' => fake()->numberBetween(500, 5000),
            'external_uid' => null,
            'notes' => null,
        ];
    }
}
