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
        Schema::create('order_package_item_menus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_package_item_id')->constrained()->onDelete('cascade');

            // 原始菜单的引用
            $table->unsignedBigInteger('menu_id')->nullable();

            // 菜单信息快照
            $table->string('menu_name');
            $table->text('menu_description')->nullable();
            // 注意：这里的价格是信息性的，实际总价已计入套餐价
            $table->decimal('base_price', 8, 2);
            $table->decimal('promotion_price', 8, 2)->nullable();
            $table->integer('quantity')->default(1)->comment('此菜单在单个套餐内的数量');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_package_item_menus');
    }
};
