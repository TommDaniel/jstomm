<?php

namespace App\Http\Controllers;

use App\Models\Album;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlbumController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $albums = $request->user()->albums()->withCount('photos')->latest()->get();

        return response()->json($albums);
    }

    public function show(Album $album): JsonResponse
    {
        $this->authorize('view', $album);

        return response()->json($album->loadCount('photos'));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:periodo,viagem,momento',
        ]);

        $album = $request->user()->albums()->create($validated);

        return response()->json($album, 201);
    }

    public function update(Request $request, Album $album): JsonResponse
    {
        $this->authorize('update', $album);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:periodo,viagem,momento',
        ]);

        $album->update($validated);

        return response()->json($album);
    }

    public function destroy(Album $album): JsonResponse
    {
        $this->authorize('delete', $album);
        $album->delete();

        return response()->json(null, 204);
    }
}
