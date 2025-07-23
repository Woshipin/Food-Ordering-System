<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Variant;

class VariantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Variant::create(['name' => '小份', 'price' => 20.00, 'variant_status' => true]);
        Variant::create(['name' => '中份', 'price' => 25.00, 'variant_status' => true]);
        Variant::create(['name' => '大份', 'price' => 30.00, 'variant_status' => true]);
        Variant::create(['name' => '家庭装', 'price' => 55.00, 'variant_status' => false]);
    }
}
