<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderPackageItemMenuAddon extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order_package_item_menu_id',
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
     * Get the package menu item that this addon belongs to.
     */
    public function orderPackageItemMenu(): BelongsTo
    {
        return $this->belongsTo(OrderPackageItemMenu::class);
    }
}
