<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactFaq extends Model
{
    protected $fillable = [
        'question_en',
        'question_zh',
        'question_ms',
        'answer_en',
        'answer_zh',
        'answer_ms',
    ];
}
