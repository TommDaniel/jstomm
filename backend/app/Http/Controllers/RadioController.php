<?php

namespace App\Http\Controllers;

use App\Models\Radio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RadioController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $radios = $request->user()->radios()->orderBy('order')->get();

        return response()->json($radios);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'stream_url' => 'required|url',
            'genre' => 'nullable|string|max:100',
            'logo_url' => 'nullable|url',
        ]);

        $radio = $request->user()->radios()->create($validated);

        return response()->json($radio, 201);
    }

    public function update(Request $request, Radio $radio): JsonResponse
    {
        $this->authorize('update', $radio);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'stream_url' => 'sometimes|url',
            'genre' => 'nullable|string|max:100',
        ]);

        $radio->update($validated);

        return response()->json($radio);
    }

    public function destroy(Radio $radio): JsonResponse
    {
        $this->authorize('delete', $radio);
        $radio->delete();

        return response()->json(null, 204);
    }

    public function toggleFavorite(Radio $radio): JsonResponse
    {
        $this->authorize('update', $radio);
        $radio->update(['is_favorite' => ! $radio->is_favorite]);

        return response()->json($radio);
    }
}
