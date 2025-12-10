<?php

namespace App\Jobs;

use App\Services\StatisticsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ComputeStatistics implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct()
    {
        Log::info('Computing statistics constructor called');
    }

    public function handle(StatisticsService $statisticsService): void
    {
        Log::info('Computing statistics...');
        
        try {
            $statisticsService->computeStatistics();
            Log::info('Statistics computed successfully');
        } catch (\Exception $e) {
            Log::error('Error computing statistics: ' . $e->getMessage());
            throw $e;
        }
    }
}
