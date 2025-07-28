<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CartPackageItemMenu extends Model
{
    protected $fillable = ['cart_package_item_id', 'menu_id', 'menu_name', 'menu_description', 'base_price', 'promotion_price', 'quantity'];

    public function packageItem(): BelongsTo
    {
        return $this->belongsTo(CartPackageItem::class);
    }

    public function addons(): HasMany
    {
        return $this->hasMany(CartPackageItemMenuAddon::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(CartPackageItemMenuVariant::class);
    }
}
