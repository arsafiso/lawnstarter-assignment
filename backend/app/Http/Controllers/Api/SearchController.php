<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\SwapiException;
use App\Http\Requests\SearchRequest;
use App\Models\SearchQuery;
use App\Services\SwapiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;

class SearchController extends Controller
{
    public function __construct(
        private SwapiService $swapiService
    ) {}

    /**
     * Search for people or films
     */
    public function search(SearchRequest $request): JsonResponse
    {

        $searchTerm = $request->validated()['query'];
        $searchType = $request->validated()['type'];
        
        $startTime = microtime(true);

        try {
            if ($searchType === 'people') {
                $results = $this->swapiService->searchPeople($searchTerm);
            } else {
                $results = $this->swapiService->searchFilms($searchTerm);
            }

            $responseTime = (microtime(true) - $startTime) * 1000;

            // Log the search query
            SearchQuery::create([
                'search_term' => $searchTerm,
                'search_type' => $searchType,
                'results_count' => $results['count'] ?? 0,
                'response_time' => $responseTime,
                'ip_address' => $request->ip(),
            ]);

            // Add IDs to results
            if ($searchType === 'people' && isset($results['results'])) {
                $results['results'] = array_map(function ($person) {
                    $person['id'] = $this->swapiService->extractIdFromUrl($person['url']);
                    return $person;
                }, $results['results']);
            } elseif ($searchType === 'films' && isset($results['results'])) {
                $results['results'] = array_map(function ($film) {
                    $film['id'] = $this->swapiService->extractIdFromUrl($film['url']);
                    return $film;
                }, $results['results']);
            }

            return response()->json([
                'success' => true,
                'data' => $results,
                'response_time' => round($responseTime, 2),
            ]);

        } catch (\Exception $e) {
            Log::error('Search error', [
                'term' => $searchTerm,
                'type' => $searchType,
                'error' => $e->getMessage(),
            ]);
            
            throw new SwapiException('Failed to search SWAPI', 0, $e);
        }
    }

    /**
     * Get person details
     */
    public function getPerson(int $id): JsonResponse
    {
        try {
            $person = $this->swapiService->getPerson($id);
            $person['id'] = $id;

            // Fetch related films
            if (!empty($person['films'])) {
                $person['films'] = $this->swapiService->fetchResourcesByUrls($person['films']);
                $person['films'] = array_map(function ($film) {
                    $film['id'] = $this->swapiService->extractIdFromUrl($film['url']);
                    return $film;
                }, $person['films']);
            }

            return response()->json([
                'success' => true,
                'data' => $person,
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching person', ['id' => $id, 'error' => $e->getMessage()]);
            throw new SwapiException('Failed to fetch person details', 0, $e);
        }
    }

    /**
     * Get film details
     */
    public function getFilm(int $id): JsonResponse
    {
        try {
            $film = $this->swapiService->getFilm($id);
            $film['id'] = $id;

            // Fetch related characters
            if (!empty($film['characters'])) {
                $film['characters'] = $this->swapiService->fetchResourcesByUrls($film['characters']);
                $film['characters'] = array_map(function ($character) {
                    $character['id'] = $this->swapiService->extractIdFromUrl($character['url']);
                    return $character;
                }, $film['characters']);
            }

            return response()->json([
                'success' => true,
                'data' => $film,
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching film', ['id' => $id, 'error' => $e->getMessage()]);
            throw new SwapiException('Failed to fetch film details', 0, $e);
        }
    }
}
