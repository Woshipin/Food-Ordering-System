<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Variant extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'price',
        'variant_status',
    ];

    public function menus()
    {
        return $this->belongsToMany(Menu::class)->withPivot('price');
    }
}

