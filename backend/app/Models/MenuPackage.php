<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class MenuPackage extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'category_id',
        'image',
        'description',
        'base_price',
        'promotion_price',
        'quantity',
        'menu_package_status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        // 修正: 将 'status' 改为数据库中实际的字段名 'menu_package_status'
        'menu_package_status' => 'boolean',
        'base_price'      => 'decimal:2',
        'promotion_price' => 'decimal:2',
        'quantity'        => 'integer',
    ];

    /**
     * 多对多关系：一个套餐可以包含多个菜单项 (Menu)
     */
    public function menus(): BelongsToMany
    {
        return $this->belongsToMany(Menu::class, 'menu_menu_package')->withTimestamps();
    }

    /**
     * 反向一对多关系：一个套餐属于一个分类 (Category)
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * 判断套餐是否启用 (使用正确的属性名)
     */
    public function isActive(): bool
    {
        return $this->menu_package_status === true;
    }

    /**
     * 返回套餐中包含的菜单项种类数量
     */
    public function menuCount(): int
    {
        return $this->menus()->count();
    }
}
