<?php

namespace App\Http\Controllers;

use App\Models\Apartment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApartmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $apartments = $request->user()
            ->apartments()
            ->withCount('bookings')
            ->with(['bookings' => function ($q) {
                $q->whereDate('check_in', '<=', now())
                    ->where(function ($q) {
                        $q->whereNull('check_out')->orWhereDate('check_out', '>=', now());
                    })
                    ->orderBy('check_in', 'desc')
                    ->limit(1);
            }])
            ->latest()
            ->get();

        return response()->json($apartments);
    }

    public function show(Apartment $apartment): JsonResponse
    {
        $this->authorize('view', $apartment);

        return response()->json($apartment->loadCount('bookings'));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:500',
            'airbnb_ical_url' => 'nullable|url|max:500',
            'notes' => 'nullable|string',
        ]);

        $apartment = $request->user()->apartments()->create($validated);

        return response()->json($apartment, 201);
    }

    public function update(Request $request, Apartment $apartment): JsonResponse
    {
        $this->authorize('update', $apartment);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'address' => 'nullable|string|max:500',
            'airbnb_ical_url' => 'nullable|url|max:500',
            'notes' => 'nullable|string',
        ]);

        $apartment->update($validated);

        return response()->json($apartment);
    }

    public function destroy(Apartment $apartment): JsonResponse
    {
        $this->authorize('delete', $apartment);
        $apartment->delete();

        return response()->json(null, 204);
    }

    public function syncAirbnb(Apartment $apartment): JsonResponse
    {
        $this->authorize('update', $apartment);

        if (! $apartment->airbnb_ical_url) {
            return response()->json(['message' => 'Apartamento sem URL iCal configurada.'], 422);
        }

        $imported = app(\App\Services\AirbnbIcalSync::class)->sync($apartment);

        return response()->json([
            'imported' => $imported,
            'message' => "{$imported} reserva(s) sincronizada(s).",
        ]);
    }
}
