<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order_number',
        'user_id',
        'status',
        'subtotal',
        'delivery_fee',
        'discount_amount',
        'total_amount',
        'service_method',
        'payment_method',
        'payment_status',
        'promo_code',
        'special_instructions',
        'pickup_time',
        'delivery_name',
        'delivery_phone',
        'delivery_address',
        'delivery_building',
        'delivery_floor',
        'delivery_latitude',
        'delivery_longitude',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'subtotal' => 'decimal:2',
        'delivery_fee' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'pickup_time' => 'datetime',
    ];

    /**
     * Get the user that owns the order.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all of the menu items for the order.
     */
    public function menuItems(): HasMany
    {
        return $this->hasMany(OrderMenuItem::class);
    }

    /**
     * Get all of the package items for the order.
     */
    public function packageItems(): HasMany
    {
        return $this->hasMany(OrderPackageItem::class);
    }
}
