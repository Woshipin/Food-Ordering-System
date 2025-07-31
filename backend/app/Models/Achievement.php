<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Achievement extends Model
{
    protected $fillable = ['icon', 'value', 'label_en', 'label_zh', 'label_ms'];
}

