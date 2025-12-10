<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\StatisticsController;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

// Endpoints with restrictive rate limit
Route::prefix('v1')->middleware('throttle:60,1')->group(function () {
    Route::post('/search', [SearchController::class, 'search']);
    Route::get('/people/{id}', [SearchController::class, 'getPerson']);
    Route::get('/films/{id}', [SearchController::class, 'getFilm']);
    Route::get('/statistics', [StatisticsController::class, 'index']);
});
