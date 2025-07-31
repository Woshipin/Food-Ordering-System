<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HomeCms extends Model
{
    use HasFactory;

    protected $fillable = [
        // Hero
        'hero_title_en', 'hero_title_zh', 'hero_title_ms',
        'hero_main_title_en', 'hero_main_title_zh', 'hero_main_title_ms',
        'hero_description_en', 'hero_description_zh', 'hero_description_ms',
        'hero_background_image',

        // Story
        'story_title_en', 'story_title_zh', 'story_title_ms',
        'story_description_en', 'story_description_zh', 'story_description_ms',
        'story_image',

        // Why Choose Us 1
        'why_choose_us_1_icon',
        'why_choose_us_1_title_en', 'why_choose_us_1_title_zh', 'why_choose_us_1_title_ms',
        'why_choose_us_1_description_en', 'why_choose_us_1_description_zh', 'why_choose_us_1_description_ms',

        // Why Choose Us 2
        'why_choose_us_2_icon',
        'why_choose_us_2_title_en', 'why_choose_us_2_title_zh', 'why_choose_us_2_title_ms',
        'why_choose_us_2_description_en', 'why_choose_us_2_description_zh', 'why_choose_us_2_description_ms',

        // Why Choose Us 3
        'why_choose_us_3_icon',
        'why_choose_us_3_title_en', 'why_choose_us_3_title_zh', 'why_choose_us_3_title_ms',
        'why_choose_us_3_description_en', 'why_choose_us_3_description_zh', 'why_choose_us_3_description_ms',

        // Business Hours
        'business_hours_title_en', 'business_hours_title_zh', 'business_hours_title_ms',
        'business_hours_description_en', 'business_hours_description_zh', 'business_hours_description_ms',

        // Contact
        'contact_title_en', 'contact_title_zh', 'contact_title_ms',
        'contact_number',

        // Delivery
        'delivery_title_en', 'delivery_title_zh', 'delivery_title_ms',
        'delivery_location',
    ];
}
