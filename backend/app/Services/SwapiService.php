<?php

namespace App\Services;

use App\Exceptions\SwapiException;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SwapiService
{
    private Client $client;
    private string $baseUrl;
    private int $cacheTTL = 3600; // 1 hour cache
    private int $maxRetries = 3;

    public function __construct()
    {
        $this->baseUrl = config('swapi.swapi_base_url');
        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'timeout' => 10.0,
            'connect_timeout' => 5.0,
        ]);
    }

    /**
     * Search for people in SWAPI with retry logic
     */
    public function searchPeople(string $searchTerm): array
    {
        return $this->executeWithRetry(function () use ($searchTerm) {
            $url = 'people/';
            Log::debug("SWAPI Request: {$this->baseUrl}{$url}?name={$searchTerm}");
            
            $response = $this->client->get($url, [
                'query' => ['name' => $searchTerm]
            ]);
            
            $content = $response->getBody()->getContents();
            $data = json_decode($content, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new SwapiException('Invalid JSON response from SWAPI');
            }
            
            return $data;
        }, 'searchPeople');
    }

    /**
     * Search for films in SWAPI with retry logic
     */
    public function searchFilms(string $searchTerm): array
    {
        return $this->executeWithRetry(function () use ($searchTerm) {
            Log::debug("SWAPI Request: {$this->baseUrl}films/?title={$searchTerm}");
            
            $response = $this->client->get('films/', [
                'query' => ['title' => $searchTerm]
            ]);

            $content = $response->getBody()->getContents();
            $data = json_decode($content, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new SwapiException('Invalid JSON response from SWAPI');
            }
            
            return $data;
        }, 'searchFilms');
    }

    /**
     * Get person details by ID
     */
    public function getPerson(int $id): array
    {
        $cacheKey = "swapi:person:{$id}";
        Log::info('Fetching person with cache key: ' . $cacheKey);
        $baseUrl = $this->baseUrl;
        $cacheTTL = $this->cacheTTL;
        return Cache::remember($cacheKey, $cacheTTL, function () use ($id, $baseUrl, $cacheTTL) {
            try {
                $client = new Client([
                    'base_uri' => $baseUrl,
                    'timeout' => 10.0,
                ]);
                $response = $client->get("people/{$id}/");
                $personData = json_decode($response->getBody()->getContents(), true);
                $films = $personData['result']['properties']['films'] ?? [];
                $filmObjects = [];
                foreach ($films as $filmUrl) {
                    $filmId = null;
                    if (preg_match('/\/films\/(\d+)/', $filmUrl, $matches)) {
                        $filmId = (int) $matches[1];
                    }
                    Log::info('Processing film URL: ' . $filmUrl . ' with ID: ' . $filmId);
                    if ($filmId) {
                        $filmData = $this->getFilmFromUrl($filmUrl, $filmId, $baseUrl, $cacheTTL);
                        if ($filmData) {
                            $filmObjects[] = $filmData;
                        }
                    }
                }
                $personData['result']['properties']['films'] = $filmObjects;
                return $personData;
            } catch (GuzzleException $e) {
                Log::error('SWAPI Get Person Error: ' . $e->getMessage());
                throw $e;
            }
        });
    }

    /**
     * Get film from URL with cache
     */
    private function getFilmFromUrl(string $url, int $id, string $baseUrl, int $cacheTTL): ?array
    {
        $filmCacheKey = "swapi:film-simple:{$id}";
        return Cache::remember($filmCacheKey, $cacheTTL, function () use ($url, $baseUrl, $id) {
            try {
                $client = new Client([
                    'base_uri' => $baseUrl,
                    'timeout' => 10.0,
                ]);
                $filmResponse = $client->get($url);
                $filmJson = json_decode($filmResponse->getBody()->getContents(), true);
                return [
                    'id' => $filmJson['result']['uid'] ?? $id,
                    'url' => $url,
                    'title' => $filmJson['result']['properties']['title'] ?? 'Unknown',
                ];
            } catch (GuzzleException $e) {
                Log::warning("Failed to fetch film from {$url}: " . $e->getMessage());
                return [
                    'id' => $id,
                    'url' => $url,
                    'title' => 'Unknown',
                ];
            }
        });
    }

    /**
     * Get film details by ID
     */
    public function getFilm(int $id): array
    {
        $cacheKey = "swapi:film:{$id}";
        Log::info('Fetching film with cache key: ' . $cacheKey);
        $baseUrl = $this->baseUrl;
        $cacheTTL = $this->cacheTTL;
        return Cache::remember($cacheKey, $cacheTTL, function () use ($id, $baseUrl, $cacheTTL) {
            try {
                $client = new Client([
                    'base_uri' => $baseUrl,
                    'timeout' => 10.0,
                ]);
                $response = $client->get("films/{$id}/");
                $filmData = json_decode($response->getBody()->getContents(), true);
                
                // Se houver characters, buscar os detalhes de cada um
                if (isset($filmData['result']['properties']['characters']) && is_array($filmData['result']['properties']['characters'])) {
                    $characters = [];
                    foreach ($filmData['result']['properties']['characters'] as $characterUrl) {
                        // Extrair id da URL
                        $charId = null;
                        if (preg_match('/\/(\d+)$/', $characterUrl, $matches)) {
                            $charId = (int) $matches[1];
                        }
                        Log::info('Processing character URL: ' . $characterUrl . ' with ID: ' . $charId);
                        if ($charId) {
                            $characterData = $this->getCharacterFromUrl($characterUrl, $charId, $baseUrl, $cacheTTL);
                            if ($characterData) {
                                $characters[] = $characterData;
                            }
                        }
                    }
                    // Substituir as URLs dos characters pelos dados completos
                    $filmData['result']['properties']['characters'] = $characters;
                }
                return $filmData;
            } catch (GuzzleException $e) {
                Log::error('SWAPI Get Film Error: ' . $e->getMessage());
                throw $e;
            }
        });
    }

    /**
     * Get character from URL with cache
     */
    private function getCharacterFromUrl(string $url, int $id, string $baseUrl, int $cacheTTL): ?array
    {
        $cacheKey = "swapi:character:{$id}";
        return Cache::remember($cacheKey, $cacheTTL, function () use ($url, $baseUrl, $id) {
            try {
                $client = new Client([
                    'base_uri' => $baseUrl,
                    'timeout' => 10.0,
                ]);
                $charResponse = $client->get($url);
                $charJson = json_decode($charResponse->getBody()->getContents(), true);
                return [
                    'id' => $charJson['result']['uid'] ?? $id,
                    'url' => $url,
                    'name' => $charJson['result']['properties']['name'] ?? 'Unknown',
                ];
            } catch (GuzzleException $e) {
                Log::warning("Failed to fetch character from {$url}: " . $e->getMessage());
                return null;
            }
        });
    }

    /**
     * Extract ID from SWAPI URL
     */
    public function extractIdFromUrl(string $url): ?int
    {
        if (preg_match('/\/(\d+)\/$/', $url, $matches)) {
            return (int) $matches[1];
        }
        return null;
    }

    /**
     * Fetch multiple resources by URLs
     */
    public function fetchResourcesByUrls(array $urls): array
    {
        $results = [];
        foreach ($urls as $url) {
            try {
                $response = $this->client->get($url);
                $results[] = json_decode($response->getBody()->getContents(), true);
            } catch (GuzzleException $e) {
                Log::warning('SWAPI Fetch Resource Error', ['url' => $url, 'error' => $e->getMessage()]);
            }
        }
        return $results;
    }

    /**
     * Execute a callable with retry logic
     */
    private function executeWithRetry(callable $callback, string $operation): array
    {
        $lastException = null;
        
        for ($attempt = 1; $attempt <= $this->maxRetries; $attempt++) {
            try {
                return $callback();
            } catch (GuzzleException $e) {
                $lastException = $e;
                Log::warning("SWAPI {$operation} attempt {$attempt}/{$this->maxRetries} failed", [
                    'error' => $e->getMessage(),
                    'code' => $e->getCode(),
                ]);
                
                // Don't retry on client errors (4xx)
                if (method_exists($e, 'hasResponse') && $e->hasResponse()) {
                    $response = $e->getResponse();
                    if ($response && $response->getStatusCode() < 500) {
                        break;
                    }
                }
                
                // Wait before retry (exponential backoff)
                if ($attempt < $this->maxRetries) {
                    usleep(100000 * $attempt); // 0.1s, 0.2s, 0.3s
                }
            }
        }
        
        Log::error("SWAPI {$operation} failed after {$this->maxRetries} attempts");
        throw new SwapiException("Failed to execute {$operation}", 0, $lastException);
    }
}
