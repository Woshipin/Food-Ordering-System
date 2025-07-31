<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('about_us_cms', function (Blueprint $table) {
            $table->id();
            $table->string('hero_title_en')->nullable();
            $table->string('hero_title_zh')->nullable();
            $table->string('hero_title_ms')->nullable();
            $table->text('hero_description_en')->nullable();
            $table->text('hero_description_zh')->nullable();
            $table->text('hero_description_ms')->nullable();

            // Story Section
            $table->string('story_image')->nullable();
            $table->string('story_title_en')->nullable();
            $table->string('story_title_zh')->nullable();
            $table->string('story_title_ms')->nullable();
            $table->text('story_description_en')->nullable();
            $table->text('story_description_zh')->nullable();
            $table->text('story_description_ms')->nullable();
            $table->timestamps();
        });

        Schema::create('achievements', function (Blueprint $table) {
            $table->id();
            $table->string('icon')->nullable();
            $table->string('value')->nullable();
            $table->text('label_en')->nullable();
            $table->text('label_zh')->nullable();
            $table->text('label_ms')->nullable();
            $table->timestamps();
        });

        Schema::create('our_teams', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('image')->nullable();
            $table->string('position_en')->nullable();
            $table->string('position_zh')->nullable();
            $table->string('position_ms')->nullable();
            $table->text('description_en')->nullable();
            $table->text('description_zh')->nullable();
            $table->text('description_ms')->nullable();
            $table->timestamps();
        });

        Schema::create('our_values', function (Blueprint $table) {
            $table->id();
            $table->string('title_en')->nullable();
            $table->string('title_zh')->nullable();
            $table->string('title_ms')->nullable();
            $table->string('icon')->nullable();
            $table->text('description_en')->nullable();
            $table->text('description_zh')->nullable();
            $table->text('description_ms')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('our_values');
        Schema::dropIfExists('our_teams');
        Schema::dropIfExists('achievements');
        Schema::dropIfExists('about_us_cms');
    }
};
