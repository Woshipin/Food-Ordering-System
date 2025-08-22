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
            $table->string('name', 50); // 餐桌名称，例如 Table A1
            $table->string('description', 100)->nullable();
            $table->integer('capacity'); // 可容纳人数
            $table->string('location', 100)->nullable(); 
            $table->boolean('is_available')->default(true); // 是否可用
            $table->timestamps();
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
