<?php

namespace App\Console\Commands;

use App\Jobs\ClassifyPhoto;
use App\Models\Photo;
use Illuminate\Console\Command;

class ClassifyBacklog extends Command
{
    protected $signature = 'photos:classify-backlog {--limit=0 : quantas fotos no máximo} {--force : reclassifica mesmo se já tem categoria}';

    protected $description = 'Enfileira jobs de classificação para todas as fotos sem categoria.';

    public function handle(): int
    {
        $q = Photo::query();
        if (! $this->option('force')) {
            $q->whereNull('category');
        }

        $limit = (int) $this->option('limit');
        if ($limit > 0) {
            $q->limit($limit);
        }

        $total = (clone $q)->count();
        if ($total === 0) {
            $this->info('Nada pra classificar.');
            return self::SUCCESS;
        }

        $this->info("Enfileirando {$total} foto(s) para classificação...");

        $q->select('id')->chunk(100, function ($chunk) {
            foreach ($chunk as $photo) {
                ClassifyPhoto::dispatch($photo->id);
            }
        });

        $this->info("Pronto. Jobs na fila — o container queue vai processando em background.");
        $this->info("Acompanhe: docker logs -f vo-70-anos-queue-1");

        return self::SUCCESS;
    }
}
