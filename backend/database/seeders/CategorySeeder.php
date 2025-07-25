<?php
namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

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
        Category::create(['name' => '汤类']);
        Category::create(['name' => '烧烤']);
        Category::create(['name' => '海鲜']);
        Category::create(['name' => '素食']);
        Category::create(['name' => '套餐']);
        Category::create(['name' => '早餐']);
        Category::create(['name' => '午餐']);
        Category::create(['name' => '晚餐']);
        Category::create(['name' => '儿童餐']);
        Category::create(['name' => '特色菜']);
        Category::create(['name' => '面食']);
        Category::create(['name' => '便当']);
        Category::create(['name' => '热炒']);
        Category::create(['name' => '异国料理']);
        Category::create(['name' => '生食']);
        Category::create(['name' => '冷盘']);
    }
}
