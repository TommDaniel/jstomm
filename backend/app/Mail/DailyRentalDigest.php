<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DailyRentalDigest extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param  array{checkInsToday: array<int,array<string,mixed>>, checkOutsToday: array<int,array<string,mixed>>, overduePayments: array<int,array<string,mixed>>, upcomingCheckIns: array<int,array<string,mixed>>}  $data
     */
    public function __construct(public array $data)
    {
    }

    public function envelope(): Envelope
    {
        $today = now()->format('d/m/Y');

        return new Envelope(
            subject: "Vó Jacinta — Resumo de Locações {$today}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.daily-digest',
            with: $this->data,
        );
    }
}
