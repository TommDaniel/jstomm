<?php

namespace Tests\Feature;

use App\Models\Apartment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApartmentApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_lists_only_own_apartments(): void
    {
        $user = User::factory()->create();
        Apartment::factory()->count(2)->create(['user_id' => $user->id]);
        Apartment::factory()->create();

        Sanctum::actingAs($user);
        $this->getJson('/api/apartments')
            ->assertOk()
            ->assertJsonCount(2);
    }

    public function test_unauthenticated_cannot_list(): void
    {
        $this->getJson('/api/apartments')->assertStatus(401);
    }

    public function test_can_create_apartment(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/apartments', [
            'name' => 'Apto Centro',
            'address' => 'Rua X, 123',
        ])
            ->assertStatus(201)
            ->assertJsonFragment(['name' => 'Apto Centro', 'user_id' => $user->id]);
    }

    public function test_create_requires_name(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/apartments', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_owner_can_show(): void
    {
        $user = User::factory()->create();
        $apt = Apartment::factory()->create(['user_id' => $user->id]);
        Sanctum::actingAs($user);

        $this->getJson("/api/apartments/{$apt->id}")->assertOk();
    }

    public function test_non_owner_cannot_show(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $apt = Apartment::factory()->create(['user_id' => $owner->id]);
        Sanctum::actingAs($other);

        $this->getJson("/api/apartments/{$apt->id}")->assertStatus(403);
    }

    public function test_owner_can_update(): void
    {
        $user = User::factory()->create();
        $apt = Apartment::factory()->create(['user_id' => $user->id]);
        Sanctum::actingAs($user);

        $this->putJson("/api/apartments/{$apt->id}", ['name' => 'Novo Nome'])
            ->assertOk()
            ->assertJsonFragment(['name' => 'Novo Nome']);
    }

    public function test_non_owner_cannot_update(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $apt = Apartment::factory()->create(['user_id' => $owner->id]);
        Sanctum::actingAs($other);

        $this->putJson("/api/apartments/{$apt->id}", ['name' => 'x'])
            ->assertStatus(403);
    }

    public function test_owner_can_delete(): void
    {
        $user = User::factory()->create();
        $apt = Apartment::factory()->create(['user_id' => $user->id]);
        Sanctum::actingAs($user);

        $this->deleteJson("/api/apartments/{$apt->id}")->assertStatus(204);
        $this->assertDatabaseMissing('apartments', ['id' => $apt->id]);
    }

    public function test_sync_airbnb_requires_ical_url(): void
    {
        $user = User::factory()->create();
        $apt = Apartment::factory()->create(['user_id' => $user->id, 'airbnb_ical_url' => null]);
        Sanctum::actingAs($user);

        $this->postJson("/api/apartments/{$apt->id}/sync-airbnb")
            ->assertStatus(422);
    }
}
