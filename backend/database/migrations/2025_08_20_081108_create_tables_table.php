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
        Schema::create('tables', function (Blueprint $table) {
            $table->id();
            $table->string('table_code', 50)->unique();
            $table->text('description')->nullable();
            $table->unsignedInteger('capacity')->default(1);
            $table->string('location', 100)->nullable();
            $table->boolean('is_available')->default(true);
            $table->timestamps();

            // --- 优化的索引策略 ---
            $table->index('is_available');
            $table->index('location');
            // Laravel 在创建外键时通常会自动为外键字段添加索引，所以 'category_id' 无需手动添加
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tables');
    }
};
