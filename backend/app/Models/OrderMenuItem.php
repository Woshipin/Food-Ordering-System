<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderMenuItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order_id',
        'menu_id',
        'menu_name',
        'menu_description',
        'image_url',
        'category_name',
        'base_price',
        'promotion_price',
        'quantity',
        'item_total',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'base_price' => 'decimal:2',
        'promotion_price' => 'decimal:2',
        'item_total' => 'decimal:2',
    ];

    /**
     * Get the order that this menu item belongs to.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the menu that this item refers to.
     */
    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class);
    }

    /**
     * Get all of the addons for the menu item.
     */
    public function addons(): HasMany
    {
        return $this->hasMany(OrderMenuItemAddon::class);
    }

    /**
     * Get all of the variants for the menu item.
     */
    public function variants(): HasMany
    {
        return $this->hasMany(OrderMenuItemVariant::class);
    }
}
