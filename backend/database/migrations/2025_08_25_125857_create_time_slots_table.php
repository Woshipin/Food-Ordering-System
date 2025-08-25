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
        // 创建time_slots表
        Schema::create('time_slots', function (Blueprint $table) {
            $table->id();
            $table->time('start_time'); // 开始时间
            $table->time('end_time');   // 结束时间
            $table->timestamps();

            // 保证 start_time + end_time 组合唯一
            $table->unique(['start_time', 'end_time']);
        });

        // 在orders表中添加time_slot_id外键
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('time_slot_id')->nullable()->constrained('time_slots')->onDelete('set null')->comment('用户选择的时间段ID');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 先删除orders表中的外键关联
        Schema::table('orders', function (Blueprint $table) {
            // 检查字段是否存在
            if (Schema::hasColumn('orders', 'time_slot_id')) {
                $table->dropForeign(['time_slot_id']);
                $table->dropColumn('time_slot_id');
            }
        });

        // 然后删除time_slots表
        Schema::dropIfExists('time_slots');
    }
};
