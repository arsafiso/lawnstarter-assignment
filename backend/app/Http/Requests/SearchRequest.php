<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class SearchRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'query' => [
                'required',
                'string',
                'min:1',
                'max:100',
                'regex:/^[a-zA-Z0-9\s\-]+$/',
            ],
            'type' => [
                'required',
                'string',
                'in:people,films',
            ],
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'query.required' => 'The search query is required.',
            'query.min' => 'The search query must be at least 1 character.',
            'query.max' => 'The search query must not exceed 100 characters.',
            'query.regex' => 'The search query can only contain letters, numbers, spaces, and hyphens.',
            'type.required' => 'The search type is required.',
            'type.in' => 'The search type must be either "people" or "films".',
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422)
        );
    }
}
