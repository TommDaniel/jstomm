<?php

namespace Tests\Feature;

use App\Models\Apartment;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BookingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_list_bookings_of_apartment(): void
    {
        $user = User::factory()->create();
        $apt = Apartment::factory()->create(['user_id' => $user->id]);
        Booking::factory()->count(3)->create(['apartment_id' => $apt->id]);
        Sanctum::actingAs($user);

        $this->getJson("/api/apartments/{$apt->id}/bookings")
            ->assertOk()
            ->assertJsonCount(3);
    }

    public function test_non_owner_cannot_list(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $apt = Apartment::factory()->create(['user_id' => $owner->id]);
        Sanctum::actingAs($other);

        $this->getJson("/api/apartments/{$apt->id}/bookings")->assertStatus(403);
    }

    public function test_owner_can_create_booking(): void
    {
        $user = User::factory()->create();
        $apt = Apartment::factory()->create(['user_id' => $user->id]);
        Sanctum::actingAs($user);

        $this->postJson("/api/apartments/{$apt->id}/bookings", [
            'tenant_name' => 'João',
            'check_in' => '2026-05-01',
            'check_out' => '2026-05-08',
            'rental_type' => 'semanal',
            'platform' => 'direto',
            'price_per_period' => 800,
        ])
            ->assertStatus(201)
            ->assertJsonFragment(['tenant_name' => 'João']);
    }

    public function test_create_validates_check_out_after_check_in(): void
    {
        $user = User::factory()->create();
        $apt = Apartment::factory()->create(['user_id' => $user->id]);
        Sanctum::actingAs($user);

        $this->postJson("/api/apartments/{$apt->id}/bookings", [
            'tenant_name' => 'João',
            'check_in' => '2026-05-10',
            'check_out' => '2026-05-01',
            'rental_type' => 'mensal',
            'platform' => 'direto',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['check_out']);
    }

    public function test_owner_can_update_booking(): void
    {
        $user = User::factory()->create();
        $apt = Apartment::factory()->create(['user_id' => $user->id]);
        $booking = Booking::factory()->create(['apartment_id' => $apt->id]);
        Sanctum::actingAs($user);

        $this->putJson("/api/bookings/{$booking->id}", ['tenant_name' => 'Maria'])
            ->assertOk()
            ->assertJsonFragment(['tenant_name' => 'Maria']);
    }

    public function test_owner_can_delete_booking(): void
    {
        $user = User::factory()->create();
        $apt = Apartment::factory()->create(['user_id' => $user->id]);
        $booking = Booking::factory()->create(['apartment_id' => $apt->id]);
        Sanctum::actingAs($user);

        $this->deleteJson("/api/bookings/{$booking->id}")->assertStatus(204);
    }

    public function test_non_owner_cannot_delete_booking(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $apt = Apartment::factory()->create(['user_id' => $owner->id]);
        $booking = Booking::factory()->create(['apartment_id' => $apt->id]);
        Sanctum::actingAs($other);

        $this->deleteJson("/api/bookings/{$booking->id}")->assertStatus(403);
    }
}
