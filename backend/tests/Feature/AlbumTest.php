<?php

namespace Tests\Feature;

use App\Models\Album;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AlbumTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_list_own_albums(): void
    {
        $user = User::factory()->create();
        Album::factory()->count(3)->create(['user_id' => $user->id]);
        Album::factory()->create(); // another user's album

        Sanctum::actingAs($user);
        $response = $this->getJson('/api/albums');

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_unauthenticated_user_cannot_list_albums(): void
    {
        $response = $this->getJson('/api/albums');

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_create_album(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/albums', [
            'name' => 'Viagem ao RS',
            'type' => 'viagem',
        ]);

        $response->assertStatus(201)
            ->assertJsonFragment([
                'name' => 'Viagem ao RS',
                'type' => 'viagem',
                'user_id' => $user->id,
            ]);

        $this->assertDatabaseHas('albums', [
            'name' => 'Viagem ao RS',
            'user_id' => $user->id,
        ]);
    }

    public function test_create_album_requires_name(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/albums', [
            'type' => 'viagem',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_create_album_requires_valid_type(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/albums', [
            'name' => 'Test Album',
            'type' => 'invalid_type',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['type']);
    }

    public function test_create_album_requires_type(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/albums', [
            'name' => 'Test Album',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['type']);
    }

    public function test_owner_can_update_album(): void
    {
        $user = User::factory()->create();
        $album = Album::factory()->create(['user_id' => $user->id, 'name' => 'Old Name']);
        Sanctum::actingAs($user);

        $response = $this->putJson("/api/albums/{$album->id}", [
            'name' => 'New Name',
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'New Name']);

        $this->assertDatabaseHas('albums', ['id' => $album->id, 'name' => 'New Name']);
    }

    public function test_non_owner_cannot_update_album(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $album = Album::factory()->create(['user_id' => $owner->id]);
        Sanctum::actingAs($other);

        $response = $this->putJson("/api/albums/{$album->id}", [
            'name' => 'Hacked Name',
        ]);

        $response->assertStatus(403);
    }

    public function test_unauthenticated_user_cannot_update_album(): void
    {
        $album = Album::factory()->create();

        $response = $this->putJson("/api/albums/{$album->id}", [
            'name' => 'New Name',
        ]);

        $response->assertStatus(401);
    }

    public function test_owner_can_delete_album(): void
    {
        $user = User::factory()->create();
        $album = Album::factory()->create(['user_id' => $user->id]);
        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/albums/{$album->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('albums', ['id' => $album->id]);
    }

    public function test_non_owner_cannot_delete_album(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $album = Album::factory()->create(['user_id' => $owner->id]);
        Sanctum::actingAs($other);

        $response = $this->deleteJson("/api/albums/{$album->id}");

        $response->assertStatus(403);
    }

    public function test_delete_nonexistent_album_returns_404(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->deleteJson('/api/albums/99999');

        $response->assertStatus(404);
    }

    public function test_albums_include_photos_count(): void
    {
        $user = User::factory()->create();
        $album = Album::factory()->create(['user_id' => $user->id]);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/albums');

        $response->assertStatus(200)
            ->assertJsonFragment(['photos_count' => 0]);
    }
}
