<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('statistics', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->json('data');
            $table->timestamp('computed_at');
            $table->timestamps();
            
            $table->index('key');
            $table->index('computed_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('statistics');
    }
};
