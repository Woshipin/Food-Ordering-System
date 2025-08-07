<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactInfo extends Model
{
    protected $fillable = [
        'type',
        'label_en',
        'label_zh',
        'label_ms',
        'value',
        'latitude',  // 新增：允许批量赋值纬度
        'longitude', // 新增：允许批量赋值经度
        'note_en',
        'note_zh',
        'note_ms',
    ];
}
