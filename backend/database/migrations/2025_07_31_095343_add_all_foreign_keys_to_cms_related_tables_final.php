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
        // Foreign keys for AboutUsCms related tables
        if (!Schema::hasColumn('achievements', 'about_us_cms_id')) {
            Schema::table('achievements', function (Blueprint $table) {
                $table->foreignId('about_us_cms_id')->nullable()->constrained('about_us_cms')->onDelete('cascade');
            });
        }

        if (!Schema::hasColumn('our_teams', 'about_us_cms_id')) {
            Schema::table('our_teams', function (Blueprint $table) {
                $table->foreignId('about_us_cms_id')->nullable()->constrained('about_us_cms')->onDelete('cascade');
            });
        }

        if (!Schema::hasColumn('our_values', 'about_us_cms_id')) {
            Schema::table('our_values', function (Blueprint $table) {
                $table->foreignId('about_us_cms_id')->nullable()->constrained('about_us_cms')->onDelete('cascade');
            });
        }

        // Foreign keys for ContactCms related tables
        if (!Schema::hasColumn('contact_infos', 'contact_cms_id')) {
            Schema::table('contact_infos', function (Blueprint $table) {
                $table->foreignId('contact_cms_id')->nullable()->constrained('contact_cms')->onDelete('cascade');
            });
        }

        if (!Schema::hasColumn('contact_maps', 'contact_cms_id')) {
            Schema::table('contact_maps', function (Blueprint $table) {
                $table->foreignId('contact_cms_id')->nullable()->constrained('contact_cms')->onDelete('cascade');
            });
        }

        if (!Schema::hasColumn('contact_faqs', 'contact_cms_id')) {
            Schema::table('contact_faqs', function (Blueprint $table) {
                $table->foreignId('contact_cms_id')->nullable()->constrained('contact_cms')->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop foreign keys for AboutUsCms
        Schema::table('achievements', function (Blueprint $table) {
            $table->dropForeign(['about_us_cms_id']);
            $table->dropColumn('about_us_cms_id');
        });

        Schema::table('our_teams', function (Blueprint $table) {
            $table->dropForeign(['about_us_cms_id']);
            $table->dropColumn('about_us_cms_id');
        });

        Schema::table('our_values', function (Blueprint $table) {
            $table->dropForeign(['about_us_cms_id']);
            $table->dropColumn('about_us_cms_id');
        });

        // Drop foreign keys for ContactCms
        Schema::table('contact_infos', function (Blueprint $table) {
            $table->dropForeign(['contact_cms_id']);
            $table->dropColumn('contact_cms_id');
        });

        Schema::table('contact_maps', function (Blueprint $table) {
            $table->dropForeign(['contact_cms_id']);
            $table->dropColumn('contact_cms_id');
        });

        Schema::table('contact_faqs', function (Blueprint $table) {
            $table->dropForeign(['contact_cms_id']);
            $table->dropColumn('contact_cms_id');
        });
    }
};
