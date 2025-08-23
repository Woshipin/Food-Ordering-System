<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany; // 建议引入类

class Table extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'table_code', // 'name' 已更改为 'table_code' 以匹配数据库字段
        'description',
        'capacity',
        'location',
        'is_available',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'capacity' => 'integer',
        'is_available' => 'boolean',
    ];

    /**
     * Get the orders for the table.
     */
    public function orders(): HasMany
    {
        // 这里的 'table_id' 是 Laravel 的默认约定
        // 它会寻找 Order 模型对应表中的 'table_id' 外键
        return $this->hasMany(Order::class, 'table_id');
    }
}
