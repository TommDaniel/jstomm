<?php

namespace App\Console\Commands;

use App\Models\Apartment;
use App\Services\AirbnbIcalSync;
use Illuminate\Console\Command;

class SyncAirbnb extends Command
{
    protected $signature = 'rentals:sync-airbnb';

    protected $description = 'Sincroniza reservas do Airbnb via iCal para cada apartamento configurado.';

    public function handle(AirbnbIcalSync $service): int
    {
        $apartments = Apartment::whereNotNull('airbnb_ical_url')->get();
        if ($apartments->isEmpty()) {
            $this->info('Nenhum apartamento com URL iCal configurada.');

            return self::SUCCESS;
        }

        $total = 0;
        foreach ($apartments as $i => $apartment) {
            if ($i > 0) {
                // Espaça as requisições pro Airbnb pra evitar rate limit.
                sleep(3);
            }
            $count = $service->sync($apartment);
            $total += $count;
            $this->info("{$apartment->name}: {$count} reserva(s) sincronizada(s).");
        }

        $this->info("Total: {$total} reserva(s) importada(s).");

        return self::SUCCESS;
    }
}
