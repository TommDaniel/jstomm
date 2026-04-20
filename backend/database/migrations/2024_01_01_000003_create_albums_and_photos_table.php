<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('albums', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->enum('type', ['periodo', 'viagem', 'momento'])->default('momento');
            $table->unsignedBigInteger('cover_photo_id')->nullable();
            $table->timestamps();
        });

        Schema::create('photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('album_id')->constrained()->cascadeOnDelete();
            $table->string('path');
            $table->string('thumbnail_path')->nullable();
            $table->string('caption')->nullable();
            $table->date('taken_at')->nullable();
            $table->integer('width')->default(0);
            $table->integer('height')->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('photos');
        Schema::dropIfExists('albums');
    }
};
