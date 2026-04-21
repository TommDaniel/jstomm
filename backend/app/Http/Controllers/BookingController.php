<?php

namespace App\Http\Controllers;

use App\Models\Apartment;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index(Apartment $apartment): JsonResponse
    {
        $this->authorize('view', $apartment);

        $bookings = $apartment->bookings()
            ->with('payments')
            ->orderBy('check_in', 'desc')
            ->get();

        return response()->json($bookings);
    }

    public function show(Booking $booking): JsonResponse
    {
        $this->authorize('view', $booking);

        return response()->json($booking->load('payments'));
    }

    public function store(Request $request, Apartment $apartment): JsonResponse
    {
        $this->authorize('update', $apartment);

        $validated = $request->validate([
            'tenant_name' => 'required|string|max:255',
            'tenant_contact' => 'nullable|string|max:255',
            'check_in' => 'required|date',
            'check_out' => 'nullable|date|after_or_equal:check_in',
            'rental_type' => 'required|in:diaria,semanal,mensal,anual',
            'platform' => 'required|in:direto,airbnb',
            'price_per_period' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $booking = $apartment->bookings()->create($validated);

        return response()->json($booking->load('payments'), 201);
    }

    public function update(Request $request, Booking $booking): JsonResponse
    {
        $this->authorize('update', $booking);

        $validated = $request->validate([
            'tenant_name' => 'sometimes|string|max:255',
            'tenant_contact' => 'nullable|string|max:255',
            'check_in' => 'sometimes|date',
            'check_out' => 'nullable|date|after_or_equal:check_in',
            'rental_type' => 'sometimes|in:diaria,semanal,mensal,anual',
            'platform' => 'sometimes|in:direto,airbnb',
            'price_per_period' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $booking->update($validated);

        return response()->json($booking->load('payments'));
    }

    public function destroy(Booking $booking): JsonResponse
    {
        $this->authorize('delete', $booking);
        $booking->delete();

        return response()->json(null, 204);
    }
}
