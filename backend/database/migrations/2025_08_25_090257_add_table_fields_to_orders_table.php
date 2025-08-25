<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 添加桌位相关字段到orders表，实现基于订单的桌位管理
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // 桌位ID - 关联到tables表的外键
            $table->foreignId('table_id')->nullable()->constrained('tables')->onDelete('set null')->comment('关联的桌位ID');

            // 桌位名称快照 - 存储订单时的桌位名称，避免桌位信息变更影响历史订单
            $table->string('table_code')->nullable()->comment('桌位名称快照');
            // 客人数量
            $table->integer('guests_count')->nullable()->comment('客人数量');
            // 用餐相关时间字段
            $table->date('dining_date')->nullable()->comment('用餐日期');
            $table->time('checkin_time')->nullable()->comment('预计入座时间');
            $table->time('checkout_time')->nullable()->comment('预计离座时间');

            // 自动延长相关字段
            $table->integer('auto_extend_count')->default(0)->comment('自动延长次数，最多2次');
            $table->integer('total_extended_minutes')->default(0)->comment('总共延长的分钟数');

            // 桌位状态 - 用于跟踪当前订单的桌位使用状态
            $table->enum('table_status', ['pending', 'completed', 'cancelled'])->nullable()->comment('桌位使用状态：pending=正在使用，completed=已完成，cancelled=已取消');

            // 是否需要桌位 - 区分dine-in订单和其他类型订单
            $table->boolean('requires_table')->default(false)->comment('是否需要桌位(dine-in订单)');
        });
    }

    /**
     * Reverse the migrations.
     * 回滚时删除所有添加的桌位相关字段
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // 删除外键约束
            $table->dropForeign(['table_id']);

            // 删除所有添加的字段
            $table->dropColumn([
                'table_id',
                'table_code',
                'dining_date',
                'checkin_time',
                'checkout_time',
                'guests_count',
                'auto_extend_count',
                'total_extended_minutes',
                'table_status',
                'requires_table',
            ]);
        });
    }
};
