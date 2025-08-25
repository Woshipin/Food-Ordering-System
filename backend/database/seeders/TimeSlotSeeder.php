<?php

namespace Database\Seeders;

use App\Models\TimeSlot;
use Illuminate\Database\Seeder;

/**
 * 时间段数据填充器
 * 用于创建餐厅营业时间内的时间段
 */
class TimeSlotSeeder extends Seeder
{
    /**
     * 执行数据库填充
     *
     * @return void
     */
    public function run(): void
    {
        // 清空现有数据（仅在开发环境）
        if (app()->environment(['local', 'testing'])) {
            TimeSlot::truncate();
        }

        // 定义时间段（每小时一个时间段）
        $timeSlots = [
            ['start_time' => '10:00:00', 'end_time' => '11:00:00'],
            ['start_time' => '11:00:00', 'end_time' => '12:00:00'],
            ['start_time' => '12:00:00', 'end_time' => '13:00:00'],
            ['start_time' => '13:00:00', 'end_time' => '14:00:00'],
            ['start_time' => '14:00:00', 'end_time' => '15:00:00'],
            ['start_time' => '15:00:00', 'end_time' => '16:00:00'],
            ['start_time' => '16:00:00', 'end_time' => '17:00:00'],
            ['start_time' => '17:00:00', 'end_time' => '18:00:00'],
            ['start_time' => '18:00:00', 'end_time' => '19:00:00'],
            ['start_time' => '19:00:00', 'end_time' => '20:00:00'],
            ['start_time' => '20:00:00', 'end_time' => '21:00:00'],
            ['start_time' => '21:00:00', 'end_time' => '22:00:00'],
        ];

        // 批量创建时间段
        foreach ($timeSlots as $slotData) {
            TimeSlot::create($slotData);
        }

        $this->command->info('时间段数据已成功创建！');
        $this->command->info('共创建了 ' . count($timeSlots) . ' 个时间段 (10:00-22:00)');
    }
}