<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartPackageItemMenuAddon extends Model
{
    protected $fillable = ['cart_package_item_menu_id', 'addon_id', 'addon_name', 'addon_price'];

    public function cartPackageItemMenu(): BelongsTo
    {
        return $this->belongsTo(CartPackageItemMenu::class, 'cart_package_item_menu_id');
    }
}
