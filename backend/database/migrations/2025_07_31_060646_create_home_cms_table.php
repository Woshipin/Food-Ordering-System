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

            // Story Section
            $table->string('story_title_en')->nullable();
            $table->string('story_title_zh')->nullable();
            $table->string('story_title_ms')->nullable();

            $table->text('story_description_en')->nullable();
            $table->text('story_description_zh')->nullable();
            $table->text('story_description_ms')->nullable();

            $table->string('story_image')->nullable();

            // Why Choose Us - Block 1
            $table->string('why_choose_us_1_icon')->nullable();
            $table->string('why_choose_us_1_title_en')->nullable();
            $table->string('why_choose_us_1_title_zh')->nullable();
            $table->string('why_choose_us_1_title_ms')->nullable();
            $table->text('why_choose_us_1_description_en')->nullable();
            $table->text('why_choose_us_1_description_zh')->nullable();
            $table->text('why_choose_us_1_description_ms')->nullable();

            // Block 2
            $table->string('why_choose_us_2_icon')->nullable();
            $table->string('why_choose_us_2_title_en')->nullable();
            $table->string('why_choose_us_2_title_zh')->nullable();
            $table->string('why_choose_us_2_title_ms')->nullable();
            $table->text('why_choose_us_2_description_en')->nullable();
            $table->text('why_choose_us_2_description_zh')->nullable();
            $table->text('why_choose_us_2_description_ms')->nullable();

            // Block 3
            $table->string('why_choose_us_3_icon')->nullable();
            $table->string('why_choose_us_3_title_en')->nullable();
            $table->string('why_choose_us_3_title_zh')->nullable();
            $table->string('why_choose_us_3_title_ms')->nullable();
            $table->text('why_choose_us_3_description_en')->nullable();
            $table->text('why_choose_us_3_description_zh')->nullable();
            $table->text('why_choose_us_3_description_ms')->nullable();

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

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('home_cms');
    }
}
