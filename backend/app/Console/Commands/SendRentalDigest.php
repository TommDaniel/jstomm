<?php

namespace App\Console\Commands;

use App\Mail\DailyRentalDigest;
use App\Models\Booking;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;

class SendRentalDigest extends Command
{
    protected $signature = 'rentals:digest';

    protected $description = 'Envia o resumo diário de locações para o email configurado.';

    public function handle(): int
    {
        $to = config('services.rentals.digest_email') ?: env('RENTALS_DIGEST_EMAIL');
        if (! $to) {
            $this->warn('RENTALS_DIGEST_EMAIL não configurado — pulando envio.');

            return self::SUCCESS;
        }

        $today = Carbon::today();
        $nextWeek = Carbon::today()->addDays(7);
        $overdueThreshold = Carbon::today()->subDays(35);

        $checkInsToday = Booking::with('apartment')
            ->whereDate('check_in', $today)
            ->get()
            ->map(fn ($b) => [
                'tenant_name' => $b->tenant_name,
                'apartment' => $b->apartment->name,
            ])
            ->all();

        $checkOutsToday = Booking::with('apartment')
            ->whereDate('check_out', $today)
            ->get()
            ->map(fn ($b) => [
                'tenant_name' => $b->tenant_name,
                'apartment' => $b->apartment->name,
            ])
            ->all();

        $upcomingCheckIns = Booking::with('apartment')
            ->whereDate('check_in', '>', $today)
            ->whereDate('check_in', '<=', $nextWeek)
            ->orderBy('check_in')
            ->get()
            ->map(fn ($b) => [
                'tenant_name' => $b->tenant_name,
                'apartment' => $b->apartment->name,
                'check_in' => $b->check_in->format('d/m'),
            ])
            ->all();

        // Monthly bookings active today whose latest payment is older than 35 days
        // (or that have no payments at all).
        $overduePayments = Booking::with(['apartment', 'payments' => fn ($q) => $q->latest('paid_at')])
            ->where('rental_type', 'mensal')
            ->whereDate('check_in', '<=', $today)
            ->where(function ($q) use ($today) {
                $q->whereNull('check_out')->orWhereDate('check_out', '>=', $today);
            })
            ->get()
            ->filter(function ($b) use ($overdueThreshold) {
                $last = $b->payments->first();

                return ! $last || $last->paid_at->lt($overdueThreshold);
            })
            ->map(fn ($b) => [
                'tenant_name' => $b->tenant_name,
                'apartment' => $b->apartment->name,
                'last_paid' => $b->payments->first()?->paid_at->format('d/m/Y'),
            ])
            ->values()
            ->all();

        Mail::to($to)->send(new DailyRentalDigest([
            'checkInsToday' => $checkInsToday,
            'checkOutsToday' => $checkOutsToday,
            'upcomingCheckIns' => $upcomingCheckIns,
            'overduePayments' => $overduePayments,
        ]));

        $this->info("Digest enviado para {$to}.");

        return self::SUCCESS;
    }
}
