<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HomeCms extends Model
{
    use HasFactory;

    protected $table = 'home_cms';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        // Hero Section
        'hero_title_en', 'hero_title_zh', 'hero_title_ms',
        'hero_main_title_en', 'hero_main_title_zh', 'hero_main_title_ms',
        'hero_description_en', 'hero_description_zh', 'hero_description_ms',
        'hero_background_image',
        'order_now_button_text_en', 'order_now_button_text_zh', 'order_now_button_text_ms',
        'view_menu_button_text_en', 'view_menu_button_text_zh', 'view_menu_button_text_ms',

        // Stats Section
        'stats_satisfied_customers_text_en', 'stats_satisfied_customers_text_zh', 'stats_satisfied_customers_text_ms',
        'stats_avg_delivery_time_text_en', 'stats_avg_delivery_time_text_zh', 'stats_avg_delivery_time_text_ms',
        'stats_user_rating_text_en', 'stats_user_rating_text_zh', 'stats_user_rating_text_ms',
        'stats_all_day_service_text_en', 'stats_all_day_service_text_zh', 'stats_all_day_service_text_ms',

        // Popular Categories
        'popular_categories_title_en', 'popular_categories_title_zh', 'popular_categories_title_ms',

        // Today Special
        'today_special_title_en', 'today_special_title_zh', 'today_special_title_ms',
        'today_special_description_en', 'today_special_description_zh', 'today_special_description_ms',

        // Why Choose Us Section
        'why_choose_us_title_en', 'why_choose_us_title_zh', 'why_choose_us_title_ms',
        'feature_fast_delivery_title_en', 'feature_fast_delivery_title_zh', 'feature_fast_delivery_title_ms',
        'feature_fast_delivery_desc_en', 'feature_fast_delivery_desc_zh', 'feature_fast_delivery_desc_ms',
        'feature_quality_ingredients_title_en', 'feature_quality_ingredients_title_zh', 'feature_quality_ingredients_title_ms',
        'feature_quality_ingredients_desc_en', 'feature_quality_ingredients_desc_zh', 'feature_quality_ingredients_desc_ms',
        'feature_quality_guarantee_title_en', 'feature_quality_guarantee_title_zh', 'feature_quality_guarantee_title_ms',
        'feature_quality_guarantee_desc_en', 'feature_quality_guarantee_desc_zh', 'feature_quality_guarantee_desc_ms',

        // Business Hours
        'business_hours_title_en', 'business_hours_title_zh', 'business_hours_title_ms',
        'business_hours_description_en', 'business_hours_description_zh', 'business_hours_description_ms',

        // Contact
        'contact_title_en', 'contact_title_zh', 'contact_title_ms',
        'contact_number',

        // Delivery
        'delivery_title_en', 'delivery_title_zh', 'delivery_title_ms',
        'delivery_location',

        // Footer Section
        'footer_slogan_en', 'footer_slogan_zh', 'footer_slogan_ms',
        'footer_privacy_policy_text_en', 'footer_privacy_policy_text_zh', 'footer_privacy_policy_text_ms',
        'footer_terms_of_service_text_en', 'footer_terms_of_service_text_zh', 'footer_terms_of_service_text_ms',
        'footer_help_center_text_en', 'footer_help_center_text_zh', 'footer_help_center_text_ms',
        'footer_all_rights_reserved_text_en', 'footer_all_rights_reserved_text_zh', 'footer_all_rights_reserved_text_ms',
    ];
}
