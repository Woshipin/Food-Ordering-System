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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            // 关联用户，但即使用户被删除，订单也应保留，所以设置为NULL
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');

            $table->string('order_number')->unique();

            // 订单状态
            $table->string('status')->default('pending');

            // 金额快照
            $table->decimal('subtotal', 10, 2);
            $table->decimal('delivery_fee', 10, 2)->default(0);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2);

            // 服务与支付方式快照
            $table->string('service_method')->comment('例如: delivery, pickup');
            $table->string('payment_method');
            $table->string('payment_status')->default('unpaid');
            $table->string('promo_code')->nullable();

            // 配送/自取信息快照
            $table->text('special_instructions')->nullable();
            $table->dateTime('pickup_time')->nullable();

            // 地址信息快照 (对于配送订单)
            $table->string('delivery_name')->nullable();
            $table->string('delivery_phone')->nullable();
            $table->text('delivery_address')->nullable();
            $table->string('delivery_building')->nullable();
            $table->string('delivery_floor')->nullable();
            $table->string('delivery_latitude')->nullable();
            $table->string('delivery_longitude')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('orders');
        Schema::enableForeignKeyConstraints();
    }
};
