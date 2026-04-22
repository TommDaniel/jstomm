<?php

namespace App\Services;

use App\Models\Apartment;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Sabre\VObject\Reader;

class AirbnbIcalSync
{
    public function sync(Apartment $apartment): int
    {
        if (! $apartment->airbnb_ical_url) {
            return 0;
        }

        $response = Http::timeout(30)
            ->withHeaders([
                'User-Agent' => 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept' => 'text/calendar,text/plain,*/*',
                'Accept-Language' => 'pt-BR,pt;q=0.9,en;q=0.8',
            ])
            ->get($apartment->airbnb_ical_url);

        if (! $response->successful()) {
            Log::warning('Airbnb iCal fetch failed', [
                'apartment_id' => $apartment->id,
                'status' => $response->status(),
                'body_preview' => substr($response->body(), 0, 200),
            ]);

            return 0;
        }

        try {
            $calendar = Reader::read($response->body());
        } catch (\Throwable $e) {
            Log::warning('Airbnb iCal parse failed', [
                'apartment_id' => $apartment->id,
                'error' => $e->getMessage(),
            ]);

            return 0;
        }

        $imported = 0;
        foreach ($calendar->VEVENT ?? [] as $event) {
            $uid = (string) $event->UID;
            if (! $uid) {
                continue;
            }

            $checkIn = $event->DTSTART->getDateTime()->format('Y-m-d');
            // iCal DTEND is exclusive; Airbnb marks the day AFTER checkout as DTEND.
            $checkOut = $event->DTEND
                ? $event->DTEND->getDateTime()->modify('-1 day')->format('Y-m-d')
                : null;

            $summary = (string) ($event->SUMMARY ?? '');
            $description = (string) ($event->DESCRIPTION ?? '');

            [$tenantName, $tenantContact, $notes] = $this->classify($summary, $description);

            $apartment->bookings()->updateOrCreate(
                ['external_uid' => $uid],
                [
                    'tenant_name' => $tenantName,
                    'tenant_contact' => $tenantContact,
                    'check_in' => $checkIn,
                    'check_out' => $checkOut,
                    'rental_type' => 'diaria',
                    'platform' => 'airbnb',
                    'notes' => $notes,
                ],
            );
            $imported++;
        }

        return $imported;
    }

    /**
     * Extrai nome do inquilino, contato e notas a partir dos campos SUMMARY/DESCRIPTION
     * do iCal do Airbnb. O Airbnb nunca expõe o nome real do hóspede — apenas flags
     * genéricas ("Reserved" pra hóspede real, "Airbnb (Not available)" pra bloqueio
     * manual do calendário). Dados úteis como URL da reserva e últimos 4 dígitos do
     * telefone vêm no DESCRIPTION.
     *
     * @return array{0: string, 1: ?string, 2: ?string}
     */
    private function classify(string $summary, string $description): array
    {
        $isBlock = stripos($summary, 'not available') !== false;

        if ($isBlock) {
            return ['Bloqueado (calendário)', null, 'Bloqueio manual no Airbnb.'];
        }

        $phone4 = null;
        if (preg_match('/Phone Number \(Last 4 Digits\):\s*(\d{4})/i', $description, $m)) {
            $phone4 = $m[1];
        }

        $url = null;
        if (preg_match('/Reservation URL:\s*(https?:\S+)/i', $description, $m)) {
            $url = rtrim($m[1], '.,;');
        }

        $tenantContact = $phone4 ? "Tel. final {$phone4}" : null;
        $notes = $url ? "Detalhes no Airbnb: {$url}" : null;

        return ['Hóspede Airbnb', $tenantContact, $notes];
    }
}
