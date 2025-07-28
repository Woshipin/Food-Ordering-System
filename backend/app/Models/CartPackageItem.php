<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CartPackageItem extends Model
{
    protected $fillable = ['cart_id', 'menu_package_id', 'package_name', 'package_description', 'package_price', 'package_image', 'quantity'];

    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    public function menus(): HasMany
    {
        return $this->hasMany(CartPackageItemMenu::class);
    }
}
