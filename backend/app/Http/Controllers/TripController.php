<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use Illuminate\Http\JsonResponse;

class TripController extends Controller
{
    public function index(): JsonResponse
    {
        $trips = Trip::select('id', 'name', 'year', 'total_km', 'category')->orderBy('year')->get();

        return response()->json($trips);
    }

    public function show(Trip $trip): JsonResponse
    {
        $trip->load('points');

        return response()->json($trip);
    }

    public function points(Trip $trip): JsonResponse
    {
        $points = $trip->points()->orderBy('order')->get();

        return response()->json($points);
    }
}
