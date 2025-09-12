<?php
namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $names = [
            '主食','饮品','小吃','甜点','汤类','烧烤','海鲜','素食','套餐',
            '早餐','午餐','晚餐','儿童餐','特色菜','面食','便当','热炒','异国料理','生食','冷盘'
        ];

        foreach ($names as $name) {
            Category::firstOrCreate(['name' => $name]);
        }
    }
}
