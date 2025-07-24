<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class MenuPackage extends Model
{
    protected $fillable = [
        'name',
        'image',
        'description',
        'price',
        'quantity', // 套餐整体数量
        'status',
    ];

    protected $casts = [
        'status'   => 'boolean',
        'price'    => 'decimal:2',
        'quantity' => 'integer',
    ];

    /**
     * 多对多关系：一个套餐可以有多个菜单项
     */
    public function menus(): BelongsToMany
    {
        return $this->belongsToMany(Menu::class)->withTimestamps();
    }

    public function menuPackages(): BelongsToMany
    {
        return $this->belongsToMany(MenuPackage::class)->withTimestamps();
    }

    /**
     * 判断套餐是否启用
     */
    public function isActive(): bool
    {
        return $this->status === true;
    }

    /**
     * 返回套餐中包含的菜单数量（种类数）
     */
    public function menuCount(): int
    {
        return $this->menus()->count();
    }
}
