<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderMenuItemAddon extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order_menu_item_id',
        'addon_id',
        'addon_name',
        'addon_price',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'addon_price' => 'decimal:2',
    ];

    /**
     * Get the menu item that this addon belongs to.
     */
    public function orderMenuItem(): BelongsTo
    {
        return $this->belongsTo(OrderMenuItem::class);
    }
}
