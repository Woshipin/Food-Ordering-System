<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartMenuItemAddon extends Model
{
    protected $fillable = ['cart_menu_item_id', 'addon_id', 'addon_name', 'addon_price'];

    public function menuItem(): BelongsTo
    {
        return $this->belongsTo(CartMenuItem::class);
    }
}
