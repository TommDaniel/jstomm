<?php

namespace Tests\Feature;

use App\Models\Apartment;
use App\Models\User;
use App\Services\AirbnbIcalSync;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SyncAirbnbTest extends TestCase
{
    use RefreshDatabase;

    private string $sampleIcal = <<<'ICS'
BEGIN:VCALENDAR
PRODID:-//Airbnb Inc//Hosting Calendar 0.8.8//EN
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
DTSTART;VALUE=DATE:20260505
DTEND;VALUE=DATE:20260510
UID:airbnb-booking-abc123@airbnb.com
SUMMARY:Reserved
DESCRIPTION:Reservation URL: https://www.airbnb.com/hosting/reservations/details/HMXYZ123\nPhone Number (Last 4 Digits): 1234
END:VEVENT
BEGIN:VEVENT
DTSTART;VALUE=DATE:20260601
DTEND;VALUE=DATE:20260605
UID:airbnb-block-def456@airbnb.com
SUMMARY:Airbnb (Not available)
END:VEVENT
END:VCALENDAR
ICS;

    public function test_sync_imports_bookings_from_ical(): void
    {
        Http::fake([
            'https://example.com/ical.ics' => Http::response($this->sampleIcal, 200),
        ]);

        $user = User::factory()->create();
        $apt = Apartment::factory()->create([
            'user_id' => $user->id,
            'airbnb_ical_url' => 'https://example.com/ical.ics',
        ]);

        $imported = app(AirbnbIcalSync::class)->sync($apt);

        $this->assertSame(2, $imported);

        $reservation = $apt->bookings()->where('external_uid', 'airbnb-booking-abc123@airbnb.com')->first();
        $this->assertNotNull($reservation);
        $this->assertSame('Hóspede Airbnb', $reservation->tenant_name);
        $this->assertSame('Tel. final 1234', $reservation->tenant_contact);
        $this->assertStringContainsString('HMXYZ123', $reservation->notes);
        $this->assertSame('2026-05-05', $reservation->check_in->format('Y-m-d'));
        $this->assertSame('2026-05-09', $reservation->check_out->format('Y-m-d'));

        $block = $apt->bookings()->where('external_uid', 'airbnb-block-def456@airbnb.com')->first();
        $this->assertNotNull($block);
        $this->assertSame('Bloqueado (calendário)', $block->tenant_name);
        $this->assertNull($block->tenant_contact);
    }

    public function test_sync_is_idempotent_via_external_uid(): void
    {
        Http::fake([
            'https://example.com/ical.ics' => Http::response($this->sampleIcal, 200),
        ]);

        $user = User::factory()->create();
        $apt = Apartment::factory()->create([
            'user_id' => $user->id,
            'airbnb_ical_url' => 'https://example.com/ical.ics',
        ]);

        app(AirbnbIcalSync::class)->sync($apt);
        app(AirbnbIcalSync::class)->sync($apt);

        $this->assertSame(2, $apt->bookings()->count());
    }

    public function test_sync_returns_zero_when_no_url(): void
    {
        $user = User::factory()->create();
        $apt = Apartment::factory()->create([
            'user_id' => $user->id,
            'airbnb_ical_url' => null,
        ]);

        $this->assertSame(0, app(AirbnbIcalSync::class)->sync($apt));
    }
}
