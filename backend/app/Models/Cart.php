<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    protected $fillable = ['user_id', 'session_id', 'is_checked_out'];

    public function menuItems(): HasMany
    {
        return $this->hasMany(CartMenuItem::class);
    }

    public function packageItems(): HasMany
    {
        return $this->hasMany(CartPackageItem::class);
    }
}
