<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Support\Facades\Log;

class SwapiException extends Exception
{
    public function __construct(string $message = "SWAPI service error", int $code = 0, ?Exception $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }

    /**
     * Report the exception.
     */
    public function report(): void
    {
        Log::error('SWAPI Exception: ' . $this->getMessage(), [
            'code' => $this->getCode(),
            'trace' => $this->getTraceAsString(),
        ]);
    }

    /**
     * Render the exception into an HTTP response.
     */
    public function render($request)
    {
        return response()->json([
            'success' => false,
            'message' => 'External API service is temporarily unavailable. Please try again later.',
            'error_code' => 'SWAPI_SERVICE_ERROR',
        ], 503);
    }
}
