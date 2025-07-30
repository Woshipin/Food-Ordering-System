<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    use HasFactory;

    protected $table = 'payment_methods';

    protected $fillable = [
        'name',
        'display_name', // 确保这个字段存在
        'description',
        'icon_name',
        'is_active', // 【建议】同步修改字段名
    ];

    protected $casts = [
        'is_active' => 'boolean', // 【建议】同步修改字段名
    ];

    public function scopeActive($query)
    {
        // 【建议】同步修改查询的字段名
        return $query->where('is_active', true);
    }
}
