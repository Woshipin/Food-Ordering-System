<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('contact_cms', function (Blueprint $table) {
            $table->id();
            $table->string('contact_title_en')->nullable();
            $table->string('contact_title_zh')->nullable();
            $table->string('contact_title_ms')->nullable();
            $table->text('contact_description_en')->nullable();
            $table->text('contact_description_zh')->nullable();
            $table->text('contact_description_ms')->nullable();
            $table->timestamps();
        });

        Schema::create('contact_infos', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['phone', 'email', 'address', 'hours']);
            $table->string('label_en')->nullable();
            $table->string('label_zh')->nullable();
            $table->string('label_ms')->nullable();
            $table->string('value')->nullable();
            $table->string('note_en')->nullable();
            $table->string('note_zh')->nullable();
            $table->string('note_ms')->nullable();
            $table->timestamps();
        });

        Schema::create('contact_maps', function (Blueprint $table) {
            $table->id();
            $table->text('map_iframe_url')->nullable();
            $table->timestamps();
        });

        Schema::create('contact_faqs', function (Blueprint $table) {
            $table->id();
            $table->string('question_en')->nullable();
            $table->string('question_zh')->nullable();
            $table->string('question_ms')->nullable();
            $table->text('answer_en')->nullable();
            $table->text('answer_zh')->nullable();
            $table->text('answer_ms')->nullable();
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contact_faqs');
        Schema::dropIfExists('contact_maps');
        Schema::dropIfExists('contact_infos');
        Schema::dropIfExists('contact_cms');
    }
};
