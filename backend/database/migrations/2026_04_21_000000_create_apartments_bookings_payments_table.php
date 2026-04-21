<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('apartments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('address')->nullable();
            $table->string('airbnb_ical_url')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('apartment_id')->constrained()->cascadeOnDelete();
            $table->string('tenant_name');
            $table->string('tenant_contact')->nullable();
            $table->date('check_in');
            $table->date('check_out')->nullable();
            $table->enum('rental_type', ['diaria', 'semanal', 'mensal', 'anual'])->default('mensal');
            $table->enum('platform', ['direto', 'airbnb'])->default('direto');
            $table->decimal('price_per_period', 10, 2)->nullable();
            $table->string('external_uid')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['apartment_id', 'check_in']);
            $table->index('external_uid');
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->date('paid_at');
            $table->string('period_label')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('apartments');
    }
};
