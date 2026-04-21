<?php

namespace Tests\Feature;

use App\Mail\DailyRentalDigest;
use App\Models\Apartment;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class RentalDigestTest extends TestCase
{
    use RefreshDatabase;

    public function test_digest_is_sent_when_email_configured(): void
    {
        config(['services.rentals.digest_email' => 'test@example.com']);
        Mail::fake();

        $user = User::factory()->create();
        $apt = Apartment::factory()->create(['user_id' => $user->id, 'name' => 'Apto 1']);
        Booking::factory()->create([
            'apartment_id' => $apt->id,
            'tenant_name' => 'João',
            'check_in' => today(),
            'check_out' => today()->addDays(2),
        ]);

        $this->artisan('rentals:digest')->assertSuccessful();

        Mail::assertSent(DailyRentalDigest::class, fn ($mail) => $mail->hasTo('test@example.com'));
    }

    public function test_digest_skips_when_email_missing(): void
    {
        config(['services.rentals.digest_email' => null]);
        Mail::fake();

        $this->artisan('rentals:digest')->assertSuccessful();

        Mail::assertNothingSent();
    }

    public function test_digest_includes_overdue_monthly_booking(): void
    {
        config(['services.rentals.digest_email' => 'test@example.com']);
        Mail::fake();

        $user = User::factory()->create();
        $apt = Apartment::factory()->create(['user_id' => $user->id, 'name' => 'Apto Mensal']);
        $booking = Booking::factory()->create([
            'apartment_id' => $apt->id,
            'tenant_name' => 'Pedro',
            'rental_type' => 'mensal',
            'check_in' => today()->subDays(90),
            'check_out' => today()->addDays(30),
        ]);
        Payment::factory()->create([
            'booking_id' => $booking->id,
            'paid_at' => today()->subDays(60),
        ]);

        $this->artisan('rentals:digest')->assertSuccessful();

        Mail::assertSent(DailyRentalDigest::class, function ($mail) {
            return collect($mail->data['overduePayments'])
                ->contains(fn ($item) => $item['tenant_name'] === 'Pedro');
        });
    }
}
