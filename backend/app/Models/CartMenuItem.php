<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CartMenuItem extends Model
{
    protected $fillable = ['cart_id', 'menu_id', 'menu_name', 'menu_description', 'base_price', 'promotion_price', 'quantity'];

    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    public function addons(): HasMany
    {
        return $this->hasMany(CartMenuItemAddon::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(CartMenuItemVariant::class);
    }
}
