<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateHomeCmsTable extends Migration
{
    public function up(): void
    {
        Schema::create('home_cms', function (Blueprint $table) {
            $table->id();

            // Hero Section
            $table->string('hero_title_en')->nullable();
            $table->string('hero_title_zh')->nullable();
            $table->string('hero_title_ms')->nullable();

            $table->string('hero_main_title_en')->nullable();
            $table->string('hero_main_title_zh')->nullable();
            $table->string('hero_main_title_ms')->nullable();

            $table->text('hero_description_en')->nullable();
            $table->text('hero_description_zh')->nullable();
            $table->text('hero_description_ms')->nullable();

            $table->string('hero_background_image')->nullable();

            // Why Choose Us Section
            $table->string('why_choose_us_title_en')->nullable();
            $table->string('why_choose_us_title_zh')->nullable();
            $table->string('why_choose_us_title_ms')->nullable();

            $table->string('feature_fast_delivery_title_en')->nullable();
            $table->string('feature_fast_delivery_title_zh')->nullable();
            $table->string('feature_fast_delivery_title_ms')->nullable();

            $table->text('feature_fast_delivery_desc_en')->nullable();
            $table->text('feature_fast_delivery_desc_zh')->nullable();
            $table->text('feature_fast_delivery_desc_ms')->nullable();

            $table->string('feature_quality_ingredients_title_en')->nullable();
            $table->string('feature_quality_ingredients_title_zh')->nullable();
            $table->string('feature_quality_ingredients_title_ms')->nullable();

            $table->text('feature_quality_ingredients_desc_en')->nullable();
            $table->text('feature_quality_ingredients_desc_zh')->nullable();
            $table->text('feature_quality_ingredients_desc_ms')->nullable();

            $table->string('feature_quality_guarantee_title_en')->nullable();
            $table->string('feature_quality_guarantee_title_zh')->nullable();
            $table->string('feature_quality_guarantee_title_ms')->nullable();

            $table->text('feature_quality_guarantee_desc_en')->nullable();
            $table->text('feature_quality_guarantee_desc_zh')->nullable();
            $table->text('feature_quality_guarantee_desc_ms')->nullable();

            // order now button text
            $table->string('order_now_button_text_en')->nullable();
            $table->string('order_now_button_text_zh')->nullable();
            $table->string('order_now_button_text_ms')->nullable();

            // view menu button text
            $table->string('view_menu_button_text_en')->nullable();
            $table->string('view_menu_button_text_zh')->nullable();
            $table->string('view_menu_button_text_ms')->nullable();

            // Statistics Section
            $table->string('stats_satisfied_customers_text_en')->nullable();
            $table->string('stats_satisfied_customers_text_zh')->nullable();
            $table->string('stats_satisfied_customers_text_ms')->nullable();

            // Average Delivery Time
            $table->string('stats_avg_delivery_time_text_en')->nullable();
            $table->string('stats_avg_delivery_time_text_zh')->nullable();
            $table->string('stats_avg_delivery_time_text_ms')->nullable();

            // User Rating
            $table->string('stats_user_rating_text_en')->nullable();
            $table->string('stats_user_rating_text_zh')->nullable();
            $table->string('stats_user_rating_text_ms')->nullable();

            // All Day Service
            $table->string('stats_all_day_service_text_en')->nullable();
            $table->string('stats_all_day_service_text_zh')->nullable();
            $table->string('stats_all_day_service_text_ms')->nullable();

            // Popular Categories
            $table->string('popular_categories_title_en')->nullable();
            $table->string('popular_categories_title_zh')->nullable();
            $table->string('popular_categories_title_ms')->nullable();

            // Today Special
            $table->string('today_special_title_en')->nullable();
            $table->string('today_special_title_zh')->nullable();
            $table->string('today_special_title_ms')->nullable();
            $table->text('today_special_description_en')->nullable();
            $table->text('today_special_description_zh')->nullable();
            $table->text('today_special_description_ms')->nullable();

            // Business Hours
            $table->string('business_hours_title_en')->nullable();
            $table->string('business_hours_title_zh')->nullable();
            $table->string('business_hours_title_ms')->nullable();

            $table->text('business_hours_description_en')->nullable();
            $table->text('business_hours_description_zh')->nullable();
            $table->text('business_hours_description_ms')->nullable();

            // Contact
            $table->string('contact_title_en')->nullable();
            $table->string('contact_title_zh')->nullable();
            $table->string('contact_title_ms')->nullable();
            $table->string('contact_number')->nullable();

            // Delivery Location
            $table->string('delivery_title_en')->nullable();
            $table->string('delivery_title_zh')->nullable();
            $table->string('delivery_title_ms')->nullable();
            $table->string('delivery_location')->nullable();

            // Footer Section
            $table->string('footer_slogan_en')->nullable();
            $table->string('footer_slogan_zh')->nullable();
            $table->string('footer_slogan_ms')->nullable();
            $table->string('footer_privacy_policy_text_en')->nullable();
            $table->string('footer_privacy_policy_text_zh')->nullable();
            $table->string('footer_privacy_policy_text_ms')->nullable();
            $table->string('footer_terms_of_service_text_en')->nullable();
            $table->string('footer_terms_of_service_text_zh')->nullable();
            $table->string('footer_terms_of_service_text_ms')->nullable();
            $table->string('footer_help_center_text_en')->nullable();
            $table->string('footer_help_center_text_zh')->nullable();
            $table->string('footer_help_center_text_ms')->nullable();
            $table->string('footer_all_rights_reserved_text_en')->nullable();
            $table->string('footer_all_rights_reserved_text_zh')->nullable();
            $table->string('footer_all_rights_reserved_text_ms')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('home_cms');
    }
}
