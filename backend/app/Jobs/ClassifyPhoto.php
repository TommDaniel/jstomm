<?php

namespace App\Jobs;

use App\Models\Photo;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ClassifyPhoto implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 120;
    public int $backoff = 30;

    public function __construct(public int $photoId) {}

    public function handle(): void
    {
        $photo = Photo::find($this->photoId);
        if (! $photo) {
            return;
        }

        $fullPath = Storage::disk('public')->path($photo->path);
        if (! is_file($fullPath)) {
            Log::warning("ClassifyPhoto: arquivo não encontrado", [
                'photo_id' => $photo->id,
                'path' => $photo->path,
            ]);
            return;
        }

        $url = rtrim(config('services.classifier.url', env('CLASSIFIER_URL', 'http://classifier:8000')), '/');

        $response = Http::timeout(90)
            ->attach('file', file_get_contents($fullPath), basename($fullPath))
            ->post($url . '/classify');

        if (! $response->successful()) {
            Log::warning('Classifier HTTP error', [
                'photo_id' => $photo->id,
                'status' => $response->status(),
                'body' => substr($response->body(), 0, 300),
            ]);
            throw new \RuntimeException("Classifier returned {$response->status()}");
        }

        $data = $response->json();

        $photo->update([
            'category' => $data['category'] ?? null,
            'category_confidence' => $data['confidence'] ?? null,
            'phash' => $data['phash'] ?? $photo->phash,
            'classified_at' => now(),
        ]);
    }
}
