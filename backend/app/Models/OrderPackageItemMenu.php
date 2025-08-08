<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderPackageItemMenu extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order_package_item_id',
        'menu_id',
        'menu_name',
        'menu_description',
        'base_price',
        'promotion_price',
        'quantity',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'base_price' => 'decimal:2',
        'promotion_price' => 'decimal:2',
    ];

    /**
     * Get the package item that this menu belongs to.
     */
    public function orderPackageItem(): BelongsTo
    {
        return $this->belongsTo(OrderPackageItem::class);
    }

    /**
     * Get all of the addons for this menu.
     */
    public function addons(): HasMany
    {
        return $this->hasMany(OrderPackageItemMenuAddon::class);
    }

    /**
     * Get all of the variants for this menu.
     */
    public function variants(): HasMany
    {
        return $this->hasMany(OrderPackageItemMenuVariant::class);
    }
}
