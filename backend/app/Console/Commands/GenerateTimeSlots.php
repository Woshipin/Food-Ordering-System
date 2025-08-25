<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\TimeSlot;

class GenerateTimeSlots extends Command
{
    /**
     * 命令签名
     * 用法：
     * php artisan timeslots:generate 10:00 22:00 60
     */
    protected $signature = 'timeslots:generate
                            {start=10:00}
                            {end=22:00}
                            {interval=60}';
    // interval 单位：分钟，默认 60 分钟

    /**
     * 命令描述
     */
    protected $description = 'Generate time slots between start and end time';

    /**
     * 执行命令
     */
    public function handle()
    {
        $start = strtotime($this->argument('start'));
        $end = strtotime($this->argument('end'));
        $interval = (int) $this->argument('interval');

        if ($start >= $end) {
            $this->error('Start time must be earlier than end time.');
            return Command::FAILURE;
        }

        while ($start < $end) {
            $slotStart = date('H:i:s', $start);
            $slotEnd = date('H:i:s', strtotime("+$interval minutes", $start));

            if (strtotime($slotEnd) > $end) {
                break; // 防止超出结束时间
            }

            TimeSlot::firstOrCreate([
                'start_time' => $slotStart,
                'end_time'   => $slotEnd,
            ]);

            $this->info("Created slot: $slotStart - $slotEnd");

            $start = strtotime("+$interval minutes", $start);
        }

        $this->info("✅ Time slots generated successfully.");
        return Command::SUCCESS;
    }
}
