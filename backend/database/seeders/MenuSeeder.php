<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Menu;
use App\Models\Category;
use App\Models\Addon;
use App\Models\Variant;
use App\Models\MenuImage;
use Illuminate\Support\Arr;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        $addons = Addon::all();
        $variants = Variant::all();

        $availableImages = [
            'beef.jpg','beefsoup.jpg','chicken.jpg','cucumber.jpg',
            'fish.jpg','kungpao.jpg','lotus.jpg','mango.jpg',
            'shrimp.jpg','sourspicy.jpg','tea.jpg','wine.jpg'
        ];

        // 菜单与对应的中文分类（按照你给的 CategorySeeder 名称）
        $menus = [
            [
                'name' => '宫保鸡丁',
                'description' => '经典川菜，鸡肉嫩滑，花生与干辣椒提味。',
                'image' => 'kungpao.jpg',
                'category' => '热炒',
            ],
            [
                'name' => '牛肉面',
                'description' => '慢炖牛肉，浓郁汤头，搭配手工面条。',
                'image' => 'beefsoup.jpg',
                'category' => '面食',
            ],
            [
                'name' => '烤三文鱼',
                'description' => '新鲜三文鱼排烤至微焦，配当季蔬菜。',
                'image' => 'fish.jpg',
                'category' => '海鲜',
            ],
            [
                'name' => '芒果布丁',
                'description' => '使用新鲜芒果泥，口感香甜顺滑。',
                'image' => 'mango.jpg',
                'category' => '甜点',
            ],
            [
                'name' => '绿茶',
                'description' => '传统热绿茶，清香解腻。',
                'image' => 'tea.jpg',
                'category' => '饮品',
            ],
        ];

        foreach ($menus as $item) {
            // 确保分类存在（若不存在则创建，保证和 package/gallery 复用相同分类表）
            $category = Category::firstOrCreate(['name' => $item['category']]);

            // 生成价格，保证 promotion_price < base_price
            $basePrice = rand(15, 60);
            $promotionPrice = rand(5, max(5, $basePrice - 1));

            $menu = Menu::create([
                'name' => $item['name'],
                'category_id' => $category->id,
                'base_price' => $basePrice,
                'promotion_price' => $promotionPrice,
                'description' => $item['description'],
                'menu_status' => true,
            ]);

            // 随机附加 addons / variants（若存在）
            if ($addons->count()) {
                $menu->addons()->attach($addons->random(rand(1, min(3, $addons->count())))->pluck('id'));
            }
            if ($variants->count()) {
                $menu->variants()->attach($variants->random(rand(1, min(2, $variants->count())))->pluck('id'));
            }

            // 主图 + 额外 0~2 张随机图
            MenuImage::create([
                'menu_id' => $menu->id,
                'image_path' => 'images/' . $item['image'],
            ]);

            foreach (range(1, rand(0, 2)) as $n) {
                MenuImage::create([
                    'menu_id' => $menu->id,
                    'image_path' => 'images/' . Arr::random($availableImages),
                ]);
            }
        }
    }
}
