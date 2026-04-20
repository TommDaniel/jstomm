<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trips', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('year')->nullable();
            $table->text('description')->nullable();
            $table->integer('total_km')->default(0);
            $table->string('category')->default('brasil'); // rs, brasil, internacional
            $table->timestamps();
        });

        Schema::create('trip_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trip_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->decimal('latitude', 10, 6);
            $table->decimal('longitude', 10, 6);
            $table->integer('order')->default(0);
            $table->integer('km_from_previous')->default(0);
            $table->date('arrival_date')->nullable();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('photo_id')->nullable();
            $table->boolean('is_car_route')->default(false);
            $table->boolean('is_hub')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trip_points');
        Schema::dropIfExists('trips');
    }
};
