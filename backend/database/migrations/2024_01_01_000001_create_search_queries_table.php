<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('search_queries', function (Blueprint $table) {
            $table->id();
            $table->string('search_term');
            $table->enum('search_type', ['people', 'films']);
            $table->integer('results_count')->default(0);
            $table->float('response_time')->comment('Response time in milliseconds');
            $table->ipAddress('ip_address')->nullable();
            $table->timestamps();
            
            $table->index('search_term');
            $table->index('search_type');
            $table->index('created_at');
            $table->index(['search_term', 'search_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('search_queries');
    }
};
