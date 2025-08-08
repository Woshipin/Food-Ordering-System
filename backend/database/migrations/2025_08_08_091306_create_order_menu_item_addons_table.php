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
        Schema::create('order_menu_item_addons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_menu_item_id')->constrained()->onDelete('cascade');

            // 原始附加项的引用
            $table->unsignedBigInteger('addon_id')->nullable();

            // 附加项信息快照
            $table->string('addon_name');
            $table->decimal('addon_price', 8, 2)->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_menu_item_addons');
    }
};
