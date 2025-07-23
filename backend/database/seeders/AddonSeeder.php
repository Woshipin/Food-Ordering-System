<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Addon;

class AddonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Addon::create(['name' => '加双份芝士', 'price' => 5.00, 'addon_status' => true]);
        Addon::create(['name' => '加培根', 'price' => 8.50, 'addon_status' => true]);
        Addon::create(['name' => '不要香菜', 'price' => 0.00, 'addon_status' => true]);
        Addon::create(['name' => '季节限定酱料', 'price' => 3.00, 'addon_status' => false]);
    }
}
