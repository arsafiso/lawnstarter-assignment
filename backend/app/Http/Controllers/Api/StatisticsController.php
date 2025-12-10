<?php

namespace App\Http\Controllers\Api;

use App\Services\StatisticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;

class StatisticsController extends Controller
{
    public function __construct(
        private StatisticsService $statisticsService
    ) {}

    /**
     * Get all statistics
     */
    public function index(): JsonResponse
    {
        try {
            $statistics = $this->statisticsService->getAllStatistics();

            return response()->json([
                'success' => true,
                'data' => $statistics,
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching statistics', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error fetching statistics. Please try again later.',
            ], 500);
        }
    }
}
