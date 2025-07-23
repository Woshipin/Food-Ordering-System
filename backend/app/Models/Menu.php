<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Menu extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category_id',
        'base_price',
        'promotion_price',
        'description',
        'menu_status',
    ];

    protected $casts = [
        'menu_status' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(MenuImage::class);
    }

    public function mainImage(): ?string
    {
        return $this->images()->first()?->image_path;
    }

    // 移除了 withPivot('price')
    public function addons(): BelongsToMany
    {
        return $this->belongsToMany(Addon::class);
    }

    public function variants(): BelongsToMany
    {
        return $this->belongsToMany(Variant::class);
    }
}
