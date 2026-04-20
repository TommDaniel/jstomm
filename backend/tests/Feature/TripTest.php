<?php

namespace Tests\Feature;

use App\Models\Trip;
use App\Models\TripPoint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TripTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_returns_all_trips_ordered_by_year(): void
    {
        Trip::factory()->create(['year' => 2000, 'name' => 'Trip A']);
        Trip::factory()->create(['year' => 1990, 'name' => 'Trip B']);
        Trip::factory()->create(['year' => 2010, 'name' => 'Trip C']);

        $response = $this->getJson('/api/trips');

        $response->assertStatus(200)
            ->assertJsonCount(3)
            ->assertJsonPath('0.year', 1990)
            ->assertJsonPath('1.year', 2000)
            ->assertJsonPath('2.year', 2010);
    }

    public function test_index_returns_only_selected_fields(): void
    {
        Trip::factory()->create();

        $response = $this->getJson('/api/trips');

        $response->assertStatus(200);
        $item = $response->json('0');
        $this->assertArrayHasKey('id', $item);
        $this->assertArrayHasKey('name', $item);
        $this->assertArrayHasKey('year', $item);
        $this->assertArrayHasKey('total_km', $item);
        $this->assertArrayHasKey('category', $item);
        $this->assertArrayNotHasKey('description', $item);
    }

    public function test_index_returns_empty_array_when_no_trips(): void
    {
        $response = $this->getJson('/api/trips');

        $response->assertStatus(200)
            ->assertJson([]);
    }

    public function test_show_returns_trip_with_points(): void
    {
        $trip = Trip::factory()->create();
        TripPoint::factory()->count(3)->create(['trip_id' => $trip->id]);

        $response = $this->getJson("/api/trips/{$trip->id}");

        $response->assertStatus(200)
            ->assertJsonPath('id', $trip->id)
            ->assertJsonPath('name', $trip->name)
            ->assertJsonCount(3, 'points');
    }

    public function test_show_returns_404_for_nonexistent_trip(): void
    {
        $response = $this->getJson('/api/trips/99999');

        $response->assertStatus(404);
    }

    public function test_show_returns_trip_without_points_when_none_exist(): void
    {
        $trip = Trip::factory()->create();

        $response = $this->getJson("/api/trips/{$trip->id}");

        $response->assertStatus(200)
            ->assertJsonPath('id', $trip->id)
            ->assertJsonCount(0, 'points');
    }

    public function test_points_returns_ordered_points(): void
    {
        $trip = Trip::factory()->create();
        TripPoint::factory()->create(['trip_id' => $trip->id, 'order' => 3, 'name' => 'Last']);
        TripPoint::factory()->create(['trip_id' => $trip->id, 'order' => 1, 'name' => 'First']);
        TripPoint::factory()->create(['trip_id' => $trip->id, 'order' => 2, 'name' => 'Middle']);

        $response = $this->getJson("/api/trips/{$trip->id}/points");

        $response->assertStatus(200)
            ->assertJsonCount(3)
            ->assertJsonPath('0.name', 'First')
            ->assertJsonPath('1.name', 'Middle')
            ->assertJsonPath('2.name', 'Last');
    }

    public function test_points_returns_empty_for_trip_with_no_points(): void
    {
        $trip = Trip::factory()->create();

        $response = $this->getJson("/api/trips/{$trip->id}/points");

        $response->assertStatus(200)
            ->assertJson([]);
    }

    public function test_points_returns_404_for_nonexistent_trip(): void
    {
        $response = $this->getJson('/api/trips/99999/points');

        $response->assertStatus(404);
    }

    public function test_trips_are_publicly_accessible_without_auth(): void
    {
        Trip::factory()->create();

        $response = $this->getJson('/api/trips');

        $response->assertStatus(200);
    }
}
