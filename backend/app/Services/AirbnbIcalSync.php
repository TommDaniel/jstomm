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

            $summary = (string) ($event->SUMMARY ?? 'Reserva Airbnb');

            // Skip Airbnb's own "Not available" blocks that aren't real bookings.
            if (stripos($summary, 'not available') !== false && ! str_contains($uid, 'airbnb.com')) {
                continue;
            }

            $apartment->bookings()->updateOrCreate(
                ['external_uid' => $uid],
                [
                    'tenant_name' => $summary,
                    'check_in' => $checkIn,
                    'check_out' => $checkOut,
                    'rental_type' => 'diaria',
                    'platform' => 'airbnb',
                ],
            );
            $imported++;
        }

        return $imported;
    }
}
