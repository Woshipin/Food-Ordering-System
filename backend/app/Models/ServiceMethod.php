<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceMethod extends Model
{
    use HasFactory;

    protected $table = 'service_methods';

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'details', // 这个字段现在和数据库匹配了
        'fee',
        'icon_name',
        'is_active', // 【建议】同步修改字段名
    ];

    protected $casts = [
        'fee' => 'decimal:2',
        'is_active' => 'boolean', // 【建议】同步修改字段名
    ];

    public function scopeActive($query)
    {
        // 【修正】查询的字段名现在和数据库及 Model 属性一致了
        return $query->where('is_active', true);
    }
}
