<?php

namespace App\Services;

use App\Models\SearchQuery;
use App\Models\Statistic;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class StatisticsService
{
    /**
     * Compute and store all statistics
     */
    public function computeStatistics(): void
    {
        $this->computeTopQueries();
        $this->computeAverageResponseTime();
        $this->computePopularHours();
        $this->computeSearchTypeDistribution();
        $this->computeTotalSearches();
    }

    /**
     * Get all current statistics
     */
    public function getAllStatistics(): array
    {
        $statistics = Statistic::all()->pluck('data', 'key')->toArray();
        
        return [
            'top_queries' => $statistics['top_queries'] ?? [],
            'average_response_time' => $statistics['average_response_time'] ?? null,
            'popular_hours' => $statistics['popular_hours'] ?? [],
            'search_type_distribution' => $statistics['search_type_distribution'] ?? [],
            'total_searches' => $statistics['total_searches'] ?? 0,
            'last_updated' => $this->getLastComputedTime(),
        ];
    }

    /**
     * Compute top 5 queries with percentages
     */
    private function computeTopQueries(): void
    {
        $totalQueries = SearchQuery::count();
        
        if ($totalQueries === 0) {
            $this->storeStat('top_queries', []);
            return;
        }

        $topQueries = SearchQuery::select('search_term', 'search_type', DB::raw('count(*) as count'))
            ->groupBy('search_term', 'search_type')
            ->orderBy('count', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($query) use ($totalQueries) {
                return [
                    'term' => $query->search_term,
                    'type' => $query->search_type,
                    'count' => $query->count,
                    'percentage' => round(($query->count / $totalQueries) * 100, 2),
                ];
            })
            ->toArray();

        $this->storeStat('top_queries', $topQueries);
    }

    /**
     * Compute average response time
     */
    private function computeAverageResponseTime(): void
    {
        $avgTime = SearchQuery::avg('response_time');
        
        $this->storeStat('average_response_time', [
            'milliseconds' => round($avgTime ?? 0, 2),
            'seconds' => round(($avgTime ?? 0) / 1000, 3),
        ]);
    }

    /**
     * Compute most popular hours for searches
     */
    private function computePopularHours(): void
    {
        $hourlyStats = SearchQuery::select(
                DB::raw('HOUR(created_at) as hour'),
                DB::raw('count(*) as count')
            )
            ->groupBy('hour')
            ->orderBy('count', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($stat) {
                return [
                    'hour' => $stat->hour,
                    'count' => $stat->count,
                    'time_range' => sprintf('%02d:00 - %02d:00', $stat->hour, ($stat->hour + 1) % 24),
                ];
            })
            ->toArray();

        $this->storeStat('popular_hours', $hourlyStats);
    }

    /**
     * Compute search type distribution
     */
    private function computeSearchTypeDistribution(): void
    {
        $total = SearchQuery::count();
        
        if ($total === 0) {
            $this->storeStat('search_type_distribution', []);
            return;
        }

        $distribution = SearchQuery::select('search_type', DB::raw('count(*) as count'))
            ->groupBy('search_type')
            ->get()
            ->map(function ($item) use ($total) {
                return [
                    'type' => $item->search_type,
                    'count' => $item->count,
                    'percentage' => round(($item->count / $total) * 100, 2),
                ];
            })
            ->toArray();

        $this->storeStat('search_type_distribution', $distribution);
    }

    /**
     * Compute total searches
     */
    private function computeTotalSearches(): void
    {
        $total = SearchQuery::count();
        $last24Hours = SearchQuery::where('created_at', '>=', Carbon::now()->subDay())->count();
        $lastHour = SearchQuery::where('created_at', '>=', Carbon::now()->subHour())->count();

        $this->storeStat('total_searches', [
            'all_time' => $total,
            'last_24_hours' => $last24Hours,
            'last_hour' => $lastHour,
        ]);
    }

    /**
     * Store statistic in database
     */
    private function storeStat(string $key, array $data): void
    {
        Statistic::updateOrCreate(
            ['key' => $key],
            [
                'data' => $data,
                'computed_at' => Carbon::now(),
            ]
        );
    }

    /**
     * Get last computed time
     */
    private function getLastComputedTime(): ?string
    {
        $latest = Statistic::latest('computed_at')->first();
        return $latest?->computed_at?->toIso8601String();
    }
}
