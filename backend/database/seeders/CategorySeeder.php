<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Category::create(['name' => '主食']);
        Category::create(['name' => '饮品']);
        Category::create(['name' => '小吃']);
        Category::create(['name' => '甜点']);
    }
}
