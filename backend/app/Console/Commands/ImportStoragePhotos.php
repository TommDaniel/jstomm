<?php

namespace App\Console\Commands;

use App\Jobs\ClassifyPhoto;
use App\Models\Album;
use App\Models\Photo;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class ImportStoragePhotos extends Command
{
    protected $signature = 'photos:import-storage
        {--dir=/var/legacy-photos : diretório com as fotos legadas}
        {--user-id=1 : user_id do dono das fotos}
        {--album=Importados : nome do álbum de destino (criado se não existir)}
        {--dry-run : lista o que seria importado sem alterar nada}';

    protected $description = 'Importa fotos soltas de um diretório, dedupa por pHash e enfileira classificação.';

    public function handle(): int
    {
        $dir = rtrim($this->option('dir'), '/');
        if (! is_dir($dir)) {
            $this->error("Diretório não existe: {$dir}");
            return self::FAILURE;
        }

        $user = User::find((int) $this->option('user-id'));
        if (! $user) {
            $this->error('User não encontrado.');
            return self::FAILURE;
        }

        $classifier = rtrim(config('services.classifier.url', env('CLASSIFIER_URL', 'http://classifier:8000')), '/');
        $dryRun = (bool) $this->option('dry-run');

        $files = collect(scandir($dir))
            ->filter(fn ($f) => is_file($dir . '/' . $f))
            ->filter(fn ($f) => preg_match('/\.(jpe?g|png|webp|gif)$/i', $f))
            ->values();

        if ($files->isEmpty()) {
            $this->info("Nenhuma imagem encontrada em {$dir}");
            return self::SUCCESS;
        }

        $this->info("Encontradas {$files->count()} imagens em {$dir}");

        $album = $dryRun
            ? null
            : Album::firstOrCreate(
                ['user_id' => $user->id, 'name' => $this->option('album')],
                ['type' => 'momento']
            );

        $existingHashes = Photo::whereNotNull('phash')->pluck('phash')->all();

        $imported = 0;
        $duplicates = 0;
        $errors = 0;

        foreach ($files as $i => $file) {
            $fullPath = $dir . '/' . $file;
            $this->output->write(sprintf("[%d/%d] %s — ", $i + 1, $files->count(), $file));

            try {
                $response = Http::timeout(60)
                    ->attach('file', file_get_contents($fullPath), $file)
                    ->post($classifier . '/phash');

                if (! $response->successful()) {
                    $this->line("<error>falhou: classifier HTTP {$response->status()}</error>");
                    $errors++;
                    continue;
                }

                $phash = $response->json('phash');
                if (! $phash) {
                    $this->line('<error>sem phash</error>');
                    $errors++;
                    continue;
                }

                // Dedup: Hamming distance <= 5 bits é considerado duplicata
                $isDup = false;
                foreach ($existingHashes as $existing) {
                    if ($this->hammingHex($phash, $existing) <= 5) {
                        $isDup = true;
                        break;
                    }
                }

                if ($isDup) {
                    $this->line('<comment>duplicata, pulando</comment>');
                    $duplicates++;
                    continue;
                }

                if ($dryRun) {
                    $this->line("<info>importaria (phash {$phash})</info>");
                    $existingHashes[] = $phash;
                    continue;
                }

                // Copia o arquivo pra storage do Laravel
                $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                $newFilename = 'photos/' . uniqid('import_', true) . '.' . $ext;
                Storage::disk('public')->put($newFilename, file_get_contents($fullPath));

                $photo = $album->photos()->create([
                    'path' => $newFilename,
                    'caption' => pathinfo($file, PATHINFO_FILENAME),
                    'width' => 0,
                    'height' => 0,
                    'phash' => $phash,
                ]);

                ClassifyPhoto::dispatch($photo->id);

                $existingHashes[] = $phash;
                $imported++;
                $this->line('<info>ok</info>');
            } catch (\Throwable $e) {
                $this->line('<error>erro: ' . $e->getMessage() . '</error>');
                $errors++;
            }
        }

        $this->newLine();
        $this->info("Resumo: {$imported} importadas · {$duplicates} duplicatas · {$errors} erros");
        if ($imported > 0) {
            $this->info("Classificação enfileirada — veja o progresso com: docker logs -f vo-70-anos-queue-1");
        }

        return self::SUCCESS;
    }

    /**
     * Hamming distance entre dois hashes hexadecimais.
     */
    private function hammingHex(string $a, string $b): int
    {
        if (strlen($a) !== strlen($b)) {
            return PHP_INT_MAX;
        }
        $binA = hex2bin($a);
        $binB = hex2bin($b);
        $xor = $binA ^ $binB;
        $dist = 0;
        for ($i = 0, $n = strlen($xor); $i < $n; $i++) {
            $dist += substr_count(decbin(ord($xor[$i])), '1');
        }
        return $dist;
    }
}
