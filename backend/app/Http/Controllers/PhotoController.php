<?php

namespace App\Http\Controllers;

use App\Jobs\ClassifyPhoto;
use App\Models\Album;
use App\Models\Photo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PhotoController extends Controller
{
    public const CATEGORIES = [
        'familia', 'viagem', 'evento', 'retrato',
        'escritorio', 'paisagem', 'documento', 'outros',
    ];

    public function index(Album $album, Request $request): JsonResponse
    {
        $q = $album->photos()->latest();
        if ($cat = $request->query('category')) {
            $q->where('category', $cat);
        }
        return response()->json($q->paginate(24));
    }

    public function store(Request $request, Album $album): JsonResponse
    {
        $this->authorize('update', $album);

        $validated = $request->validate([
            'photos' => 'required|array',
            'photos.*' => 'image|max:10240',
            'category' => 'nullable|in:' . implode(',', self::CATEGORIES),
        ]);

        $category = $validated['category'] ?? null;

        $created = [];
        foreach ($request->file('photos') as $file) {
            $path = $file->store('photos', 'public');
            $photo = $album->photos()->create([
                'path' => $path,
                'caption' => $request->input('caption'),
                'width' => 0,
                'height' => 0,
                'category' => $category,
                'classified_at' => $category ? now() : null,
            ]);
            // Se usuário não especificou, deixa o classifier decidir em background
            if (! $category) {
                ClassifyPhoto::dispatch($photo->id)->afterResponse();
            }
            $created[] = $photo;
        }

        return response()->json($created, 201);
    }

    public function updateCategory(Request $request, Photo $photo): JsonResponse
    {
        $this->authorize('delete', $photo); // reuso da policy — dono pode corrigir

        $validated = $request->validate([
            'category' => 'required|in:' . implode(',', self::CATEGORIES),
        ]);

        $photo->update([
            'category' => $validated['category'],
            'classified_at' => now(),
        ]);

        return response()->json($photo);
    }

    public function destroy(Photo $photo): JsonResponse
    {
        $this->authorize('delete', $photo);
        Storage::disk('public')->delete($photo->path);
        $photo->delete();

        return response()->json(null, 204);
    }
}
