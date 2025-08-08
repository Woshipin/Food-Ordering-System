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
        Schema::create('order_package_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');

            // 原始套餐的引用
            $table->unsignedBigInteger('menu_package_id')->nullable();

            // 套餐信息快照
            $table->string('package_name');
            $table->text('package_description')->nullable();
            $table->decimal('package_price', 8, 2)->nullable();
            $table->string('package_image')->nullable();
            $table->string('category_name')->nullable();
            $table->integer('quantity');

            // 此项的总金额 ( (package_price + all_extras) * quantity )
            $table->decimal('item_total', 10, 2);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_package_items');
    }
};
