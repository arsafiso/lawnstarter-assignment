<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SearchQuery extends Model
{
    use HasFactory;

    protected $fillable = [
        'search_term',
        'search_type',
        'results_count',
        'response_time',
        'ip_address',
    ];

    protected $casts = [
        'response_time' => 'float',
        'results_count' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Scope to filter by search type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('search_type', $type);
    }

    /**
     * Scope to filter by date range
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Get the most popular searches
     */
    public static function getMostPopular(int $limit = 10)
    {
        return static::selectRaw('search_term, search_type, COUNT(*) as count')
            ->groupBy('search_term', 'search_type')
            ->orderByDesc('count')
            ->limit($limit)
            ->get();
    }
}
