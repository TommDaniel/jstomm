<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function store(Request $request, Booking $booking): JsonResponse
    {
        $this->authorize('update', $booking);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'paid_at' => 'required|date',
            'period_label' => 'nullable|string|max:255',
        ]);

        $payment = $booking->payments()->create($validated);

        return response()->json($payment, 201);
    }

    public function destroy(Payment $payment): JsonResponse
    {
        $this->authorize('delete', $payment);
        $payment->delete();

        return response()->json(null, 204);
    }
}
