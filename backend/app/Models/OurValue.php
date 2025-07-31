<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OurValue extends Model
{
    protected $fillable = [
        'title_en', 'title_zh', 'title_ms',
        'icon',
        'description_en', 'description_zh', 'description_ms',
    ];
}

