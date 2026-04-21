<?php

namespace Tests\Feature;

use App\Models\Apartment;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PaymentApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_add_payment(): void
    {
        $user = User::factory()->create();
        $apt = Apartment::factory()->create(['user_id' => $user->id]);
        $booking = Booking::factory()->create(['apartment_id' => $apt->id]);
        Sanctum::actingAs($user);

        $this->postJson("/api/bookings/{$booking->id}/payments", [
            'amount' => 1500,
            'paid_at' => '2026-04-01',
            'period_label' => 'Abril/2026',
        ])
            ->assertStatus(201)
            ->assertJsonFragment(['period_label' => 'Abril/2026']);
    }

    public function test_non_owner_cannot_add_payment(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $apt = Apartment::factory()->create(['user_id' => $owner->id]);
        $booking = Booking::factory()->create(['apartment_id' => $apt->id]);
        Sanctum::actingAs($other);

        $this->postJson("/api/bookings/{$booking->id}/payments", [
            'amount' => 1500,
            'paid_at' => '2026-04-01',
        ])->assertStatus(403);
    }

    public function test_owner_can_delete_payment(): void
    {
        $user = User::factory()->create();
        $apt = Apartment::factory()->create(['user_id' => $user->id]);
        $booking = Booking::factory()->create(['apartment_id' => $apt->id]);
        $payment = Payment::factory()->create(['booking_id' => $booking->id]);
        Sanctum::actingAs($user);

        $this->deleteJson("/api/payments/{$payment->id}")->assertStatus(204);
    }

    public function test_add_payment_requires_amount(): void
    {
        $user = User::factory()->create();
        $apt = Apartment::factory()->create(['user_id' => $user->id]);
        $booking = Booking::factory()->create(['apartment_id' => $apt->id]);
        Sanctum::actingAs($user);

        $this->postJson("/api/bookings/{$booking->id}/payments", [
            'paid_at' => '2026-04-01',
        ])->assertStatus(422)->assertJsonValidationErrors(['amount']);
    }
}
