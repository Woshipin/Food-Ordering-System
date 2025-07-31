<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ContactCms extends Model
{
    protected $fillable = [
        'contact_title_en',
        'contact_title_zh',
        'contact_title_ms',
        'contact_description_en',
        'contact_description_zh',
        'contact_description_ms',
    ];

    public function contact_infos(): HasMany
    {
        return $this->hasMany(ContactInfo::class);
    }

    public function contact_maps(): HasMany
    {
        return $this->hasMany(ContactMap::class);
    }

    public function contact_faqs(): HasMany
    {
        return $this->hasMany(ContactFaq::class);
    }
}
