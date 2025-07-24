<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Menu;
use App\Models\Category;
use App\Models\Addon;
use App\Models\Variant;
use App\Models\MenuImage;
use Illuminate\Support\Arr; // <-- 1. 引入 Arr 辅助函数

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 假设你已有 category、addon、variant 数据
        $categories = Category::all();
        $addons = Addon::all();
        $variants = Variant::all();

        // 2. 定义一个包含你所有真实图片文件名的数组
        $availableImages = [
            'beef.jpg', 'beefsoup.jpg', 'chicken.jpg', 'cucumber.jpg',
            'fish.jpg', 'kungpao.jpg', 'lotus.jpg', 'mango.jpg',
            'shrimp.jpg', 'sourspicy.jpg', 'tea.jpg', 'wine.jpg'
        ];

        // 创建 5 个 Menu
        foreach (range(1, 5) as $i) {
            $menu = Menu::create([
                'name' => 'Menu Item ' . $i,
                'category_id' => $categories->random()->id,
                'base_price' => rand(10, 50),
                'promotion_price' => rand(5, 30),
                'description' => 'This is a sample menu item ' . $i,
                'menu_status' => true,
            ]);

            // 附加随机的 addon 和 variant
            $menu->addons()->attach($addons->random(rand(1, 3))->pluck('id'));
            $menu->variants()->attach($variants->random(rand(1, 2))->pluck('id'));

            // 为每个菜单添加 1 到 3 张随机的真实图片
            foreach (range(1, rand(1, 3)) as $img) {
                MenuImage::create([
                    'menu_id' => $menu->id,
                    // 3. 从数组中随机选择一个图片，并拼接成正确的路径
                    'image_path' => 'images/' . Arr::random($availableImages),
                ]);
            }
        }
    }
}
