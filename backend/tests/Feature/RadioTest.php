<?php

namespace Tests\Feature;

use App\Models\Radio;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RadioTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_list_own_radios(): void
    {
        $user = User::factory()->create();
        Radio::factory()->count(3)->create(['user_id' => $user->id]);
        Radio::factory()->create(); // another user's radio

        Sanctum::actingAs($user);
        $response = $this->getJson('/api/radios');

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_radios_are_returned_ordered_by_order(): void
    {
        $user = User::factory()->create();
        Radio::factory()->create(['user_id' => $user->id, 'order' => 3, 'name' => 'Third']);
        Radio::factory()->create(['user_id' => $user->id, 'order' => 1, 'name' => 'First']);
        Radio::factory()->create(['user_id' => $user->id, 'order' => 2, 'name' => 'Second']);

        Sanctum::actingAs($user);
        $response = $this->getJson('/api/radios');

        $response->assertStatus(200)
            ->assertJsonPath('0.name', 'First')
            ->assertJsonPath('1.name', 'Second')
            ->assertJsonPath('2.name', 'Third');
    }

    public function test_unauthenticated_user_cannot_list_radios(): void
    {
        $response = $this->getJson('/api/radios');

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_create_radio(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/radios', [
            'name' => 'Rádio Gaúcha',
            'stream_url' => 'https://stream.radiogaucha.com.br/rg_128kbps',
            'genre' => 'gaúcha',
        ]);

        $response->assertStatus(201)
            ->assertJsonFragment([
                'name' => 'Rádio Gaúcha',
                'user_id' => $user->id,
            ]);

        $this->assertDatabaseHas('radios', ['name' => 'Rádio Gaúcha', 'user_id' => $user->id]);
    }

    public function test_create_radio_requires_name(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/radios', [
            'stream_url' => 'https://stream.example.com/radio',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_create_radio_requires_valid_stream_url(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/radios', [
            'name' => 'Test Radio',
            'stream_url' => 'not-a-url',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['stream_url']);
    }

    public function test_create_radio_requires_stream_url(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/radios', [
            'name' => 'Test Radio',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['stream_url']);
    }

    public function test_owner_can_update_radio(): void
    {
        $user = User::factory()->create();
        $radio = Radio::factory()->create(['user_id' => $user->id, 'name' => 'Old Name']);
        Sanctum::actingAs($user);

        $response = $this->putJson("/api/radios/{$radio->id}", [
            'name' => 'New Name',
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'New Name']);
    }

    public function test_non_owner_cannot_update_radio(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $radio = Radio::factory()->create(['user_id' => $owner->id]);
        Sanctum::actingAs($other);

        $response = $this->putJson("/api/radios/{$radio->id}", [
            'name' => 'Hacked',
        ]);

        $response->assertStatus(403);
    }

    public function test_owner_can_delete_radio(): void
    {
        $user = User::factory()->create();
        $radio = Radio::factory()->create(['user_id' => $user->id]);
        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/radios/{$radio->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('radios', ['id' => $radio->id]);
    }

    public function test_non_owner_cannot_delete_radio(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $radio = Radio::factory()->create(['user_id' => $owner->id]);
        Sanctum::actingAs($other);

        $response = $this->deleteJson("/api/radios/{$radio->id}");

        $response->assertStatus(403);
    }

    public function test_owner_can_toggle_favorite(): void
    {
        $user = User::factory()->create();
        $radio = Radio::factory()->create(['user_id' => $user->id, 'is_favorite' => false]);
        Sanctum::actingAs($user);

        $response = $this->putJson("/api/radios/{$radio->id}/favorite");

        $response->assertStatus(200)
            ->assertJsonFragment(['is_favorite' => true]);

        $this->assertDatabaseHas('radios', ['id' => $radio->id, 'is_favorite' => true]);
    }

    public function test_toggle_favorite_toggles_back_to_false(): void
    {
        $user = User::factory()->create();
        $radio = Radio::factory()->create(['user_id' => $user->id, 'is_favorite' => true]);
        Sanctum::actingAs($user);

        $response = $this->putJson("/api/radios/{$radio->id}/favorite");

        $response->assertStatus(200)
            ->assertJsonFragment(['is_favorite' => false]);
    }

    public function test_non_owner_cannot_toggle_favorite(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $radio = Radio::factory()->create(['user_id' => $owner->id]);
        Sanctum::actingAs($other);

        $response = $this->putJson("/api/radios/{$radio->id}/favorite");

        $response->assertStatus(403);
    }

    public function test_unauthenticated_cannot_toggle_favorite(): void
    {
        $radio = Radio::factory()->create();

        $response = $this->putJson("/api/radios/{$radio->id}/favorite");

        $response->assertStatus(401);
    }
}
