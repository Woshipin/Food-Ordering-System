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
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();

            // Relación con el usuario
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Campos del frontend
            $table->string('name');
            $table->string('phone');
            $table->string('address');
            $table->decimal('latitude', 10, 6)->nullable()->after('address');
            $table->decimal('longitude', 11, 6)->nullable()->after('latitude');
            $table->string('building')->nullable();
            $table->string('floor')->nullable();
            $table->boolean('is_default')->default(false);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('addresses');
    }
};
