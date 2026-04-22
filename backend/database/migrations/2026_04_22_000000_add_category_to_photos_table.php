<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('photos', function (Blueprint $table) {
            $table->string('category', 32)->nullable();
            $table->decimal('category_confidence', 5, 4)->nullable();
            $table->timestamp('classified_at')->nullable();
            $table->string('phash', 16)->nullable()->index();
        });
    }

    public function down(): void
    {
        Schema::table('photos', function (Blueprint $table) {
            $table->dropColumn(['category', 'category_confidence', 'classified_at', 'phash']);
        });
    }
};
