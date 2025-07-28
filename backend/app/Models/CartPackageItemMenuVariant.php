<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartPackageItemMenuVariant extends Model
{
    protected $fillable = ['cart_package_item_menu_id', 'variant_id', 'variant_name', 'variant_price'];

    public function cartPackageItemMenu(): BelongsTo
    {
        return $this->belongsTo(CartPackageItemMenu::class, 'cart_package_item_menu_id');
    }
}
