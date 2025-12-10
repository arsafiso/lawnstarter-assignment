<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Statistic extends Model
{
    protected $fillable = [
        'key',
        'data',
        'computed_at',
    ];

    protected $casts = [
        'data' => 'array',
        'computed_at' => 'datetime',
    ];
}
