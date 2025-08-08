<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderPackageItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order_id',
        'menu_package_id',
        'package_name',
        'package_description',
        'package_price',
        'package_image',
        'category_name',
        'quantity',
        'item_total',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'package_price' => 'decimal:2',
        'item_total' => 'decimal:2',
    ];

    /**
     * Get the order that this package item belongs to.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get all of the menus for the package item.
     */
    public function menus(): HasMany
    {
        return $this->hasMany(OrderPackageItemMenu::class);
    }
}
