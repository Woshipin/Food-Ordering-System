<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AboutUsCms extends Model
{
    protected $fillable = [
        'hero_title_en', 'hero_title_zh', 'hero_title_ms',
        'hero_description_en', 'hero_description_zh', 'hero_description_ms',
        'story_image', 'story_title_en', 'story_title_zh', 'story_title_ms',
        'story_description_en', 'story_description_zh', 'story_description_ms',
    ];

    public function achievements(): HasMany
    {
        return $this->hasMany(Achievement::class);
    }

    public function our_teams(): HasMany
    {
        return $this->hasMany(OurTeam::class);
    }

    public function our_values(): HasMany
    {
        return $this->hasMany(OurValue::class);
    }
}
