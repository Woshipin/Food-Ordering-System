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
        Schema::create('cart_menu_item_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cart_menu_item_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('variant_id');
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
        Schema::dropIfExists('cart_menu_item_variants');
    }
};
