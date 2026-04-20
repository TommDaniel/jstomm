<?php

namespace Tests\Feature;

use App\Models\Album;
use App\Models\Photo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PhotoTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_list_photos_in_album(): void
    {
        $user = User::factory()->create();
        $album = Album::factory()->create(['user_id' => $user->id]);
        Photo::factory()->count(5)->create(['album_id' => $album->id]);
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/albums/{$album->id}/photos");

        $response->assertStatus(200)
            ->assertJsonPath('total', 5);
    }

    public function test_photos_are_paginated(): void
    {
        $user = User::factory()->create();
        $album = Album::factory()->create(['user_id' => $user->id]);
        Photo::factory()->count(30)->create(['album_id' => $album->id]);
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/albums/{$album->id}/photos");

        $response->assertStatus(200)
            ->assertJsonPath('per_page', 24)
            ->assertJsonCount(24, 'data');
    }

    public function test_unauthenticated_user_cannot_list_photos(): void
    {
        $album = Album::factory()->create();

        $response = $this->getJson("/api/albums/{$album->id}/photos");

        $response->assertStatus(401);
    }

    public function test_list_photos_returns_404_for_nonexistent_album(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/albums/99999/photos');

        $response->assertStatus(404);
    }

    public function test_album_owner_can_upload_photos(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $album = Album::factory()->create(['user_id' => $user->id]);
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/albums/{$album->id}/photos", [
            'photos' => [
                UploadedFile::fake()->image('photo1.jpg'),
                UploadedFile::fake()->image('photo2.jpg'),
            ],
        ]);

        $response->assertStatus(201)
            ->assertJsonCount(2);

        $this->assertDatabaseCount('photos', 2);
    }

    public function test_non_owner_cannot_upload_photos(): void
    {
        Storage::fake('public');
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $album = Album::factory()->create(['user_id' => $owner->id]);
        Sanctum::actingAs($other);

        $response = $this->postJson("/api/albums/{$album->id}/photos", [
            'photos' => [UploadedFile::fake()->image('photo.jpg')],
        ]);

        $response->assertStatus(403);
    }

    public function test_upload_requires_photos_array(): void
    {
        $user = User::factory()->create();
        $album = Album::factory()->create(['user_id' => $user->id]);
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/albums/{$album->id}/photos", []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['photos']);
    }

    public function test_upload_rejects_non_image_files(): void
    {
        $user = User::factory()->create();
        $album = Album::factory()->create(['user_id' => $user->id]);
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/albums/{$album->id}/photos", [
            'photos' => [UploadedFile::fake()->create('document.pdf', 100, 'application/pdf')],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['photos.0']);
    }

    public function test_owner_can_delete_photo(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $album = Album::factory()->create(['user_id' => $user->id]);
        $photo = Photo::factory()->create([
            'album_id' => $album->id,
            'path' => 'photos/test.jpg',
        ]);
        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/photos/{$photo->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('photos', ['id' => $photo->id]);
    }

    public function test_non_owner_cannot_delete_photo(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $album = Album::factory()->create(['user_id' => $owner->id]);
        $photo = Photo::factory()->create(['album_id' => $album->id]);
        Sanctum::actingAs($other);

        $response = $this->deleteJson("/api/photos/{$photo->id}");

        $response->assertStatus(403);
    }

    public function test_unauthenticated_user_cannot_delete_photo(): void
    {
        $album = Album::factory()->create();
        $photo = Photo::factory()->create(['album_id' => $album->id]);

        $response = $this->deleteJson("/api/photos/{$photo->id}");

        $response->assertStatus(401);
    }

    public function test_delete_nonexistent_photo_returns_404(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->deleteJson('/api/photos/99999');

        $response->assertStatus(404);
    }
}
