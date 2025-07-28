<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartMenuItemVariant extends Model
{
    protected $fillable = ['cart_menu_item_id', 'variant_id', 'variant_name', 'variant_price'];

    public function menuItem(): BelongsTo
    {
        return $this->belongsTo(CartMenuItem::class);
    }
}
