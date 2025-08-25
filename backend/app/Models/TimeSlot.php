<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TimeSlot extends Model
{
    protected $fillable = [
        'start_time',
        'end_time',
    ];

    // 时间字段保持为字符串格式（HH:MM:SS），不进行类型转换
}
