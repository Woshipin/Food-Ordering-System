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
        Schema::create('menu_packages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('category_id')->nullable()->constrained()->onDelete('set null');
            $table->string('image')->nullable();
            $table->text('description')->nullable();
            $table->decimal('base_price', 8, 2)->nullable();
            $table->decimal('promotion_price', 8, 2)->nullable();
            $table->integer('quantity')->nullable()->default(null); // 整体套餐数量
            $table->boolean('menu_package_status')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_packages');
    }
};
