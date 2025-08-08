<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderMenuItemVariant extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order_menu_item_id',
        'variant_id',
        'variant_name',
        'variant_price',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'variant_price' => 'decimal:2',
    ];

    /**
     * Get the menu item that this variant belongs to.
     */
    public function orderMenuItem(): BelongsTo
    {
        return $this->belongsTo(OrderMenuItem::class);
    }
}
