<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
}
