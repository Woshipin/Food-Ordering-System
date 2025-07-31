<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OurTeam extends Model
{
    protected $fillable = [
        'name', 'image',
        'position_en', 'position_zh', 'position_ms',
        'description_en', 'description_zh', 'description_ms',
    ];
}

