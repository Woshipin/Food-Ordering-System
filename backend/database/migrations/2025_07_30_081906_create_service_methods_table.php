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
        Schema::create('service_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique();
            $table->string('display_name');
            $table->string('description')->nullable();
            // 【新增】这个字段在 Model 中已经定义，此处补上
            $table->string('details')->nullable();
            $table->decimal('fee', 8, 2)->default(0.00);
            $table->string('icon_name', 50);
            // 【建议】将字段名改为 is_active，与 scopeActive 方法保持一致
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_methods');
    }
};
