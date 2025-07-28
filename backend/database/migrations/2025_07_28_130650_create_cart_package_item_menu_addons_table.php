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
        Schema::create('cart_package_item_menu_addons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cart_package_item_menu_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('addon_id');
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
        Schema::dropIfExists('cart_package_item_menu_addons');
    }
};
