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

        $response = Http::timeout(30)->get($apartment->airbnb_ical_url);
        if (! $response->successful()) {
            Log::warning('Airbnb iCal fetch failed', [
                'apartment_id' => $apartment->id,
                'status' => $response->status(),
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
