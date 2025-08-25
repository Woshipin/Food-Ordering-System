<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Console\Commands\CheckTableReservations;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// 桌位自动化管理的定时任务调度
// 每5分钟执行一次桌位状态检查
Schedule::command('tables:check-reservations')
    ->everyFiveMinutes()
    ->withoutOverlapping()
    ->runInBackground()
    ->appendOutputTo(storage_path('logs/table-reservations.log'));

// 每小时执行一次详细检查（包含详细日志）
Schedule::command('tables:check-reservations --verbose')
    ->hourly()
    ->withoutOverlapping()
    ->runInBackground()
    ->appendOutputTo(storage_path('logs/table-reservations-hourly.log'));
