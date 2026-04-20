<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\Photo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PhotoController extends Controller
{
    public function index(Album $album): JsonResponse
    {
        $photos = $album->photos()->latest()->paginate(24);

        return response()->json($photos);
    }

    public function store(Request $request, Album $album): JsonResponse
    {
        $this->authorize('update', $album);

        $request->validate([
            'photos' => 'required|array',
            'photos.*' => 'image|max:10240',
        ]);

        $created = [];
        foreach ($request->file('photos') as $file) {
            $path = $file->store('photos', 'public');
            $created[] = $album->photos()->create([
                'path' => $path,
                'caption' => $request->input('caption'),
                'width' => 0,
                'height' => 0,
            ]);
        }

        return response()->json($created, 201);
    }

    public function destroy(Photo $photo): JsonResponse
    {
        $this->authorize('delete', $photo);
        Storage::disk('public')->delete($photo->path);
        $photo->delete();

        return response()->json(null, 204);
    }
}
