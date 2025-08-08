<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderPackageItemMenuVariant extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order_package_item_menu_id',
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
     * Get the package menu item that this variant belongs to.
     */
    public function orderPackageItemMenu(): BelongsTo
    {
        return $this->belongsTo(OrderPackageItemMenu::class);
    }
}
