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
        Schema::create('order_package_item_menu_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_package_item_menu_id')->constrained()->onDelete('cascade');

            // 原始规格的引用
            $table->unsignedBigInteger('variant_id')->nullable();

            // 规格信息快照 (额外费用会累加到套餐总价上)
            $table->string('variant_name');
            $table->decimal('variant_price', 8, 2)->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_package_item_menu_variants');
    }
};
