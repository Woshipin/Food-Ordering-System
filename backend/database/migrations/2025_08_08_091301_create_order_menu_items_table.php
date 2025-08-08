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
        Schema::create('order_menu_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');

            // 原始菜单的引用 (用于分析，可为空以防菜单被删除)
            $table->unsignedBigInteger('menu_id')->nullable();

            // 菜单信息快照
            $table->string('menu_name');
            $table->text('menu_description')->nullable();
            $table->string('image_url')->nullable();
            $table->string('category_name')->nullable();
            $table->decimal('base_price', 8, 2);
            $table->decimal('promotion_price', 8, 2)->nullable();
            $table->integer('quantity');

            // 此项的总金额 ( (price + addons + variants) * quantity )
            $table->decimal('item_total', 10, 2);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_menu_items');
    }
};
