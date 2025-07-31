<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactInfo extends Model
{
    protected $fillable = [
        'type',
        'label_en',
        'label_zh',
        'label_ms',
        'value',
        'note_en',
        'note_zh',
        'note_ms',
    ];
}
