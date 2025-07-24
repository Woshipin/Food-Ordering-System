<?php
namespace Database\Seeders;

use App\Models\Menu;
use App\Models\MenuPackage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;

class MenuPackageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. 获取所有已存在的菜单，套餐需要从这里面选择
        $menus = Menu::all();

        // 如果没有任何菜单，就无法创建套餐，直接退出
        if ($menus->isEmpty()) {
            $this->command->info('No menus found, skipping MenuPackageSeeder.');
            return;
        }

        // 2. 定义一个包含你所有真实图片文件名的数组
        $availableImages = [
            'beef.jpg', 'beefsoup.jpg', 'chicken.jpg', 'cucumber.jpg',
            'fish.jpg', 'kungpao.jpg', 'lotus.jpg', 'mango.jpg',
            'shrimp.jpg', 'sourspicy.jpg', 'tea.jpg', 'wine.jpg',
        ];

        // 3. 循环创建 4 个菜单套餐
        foreach (range(1, 4) as $index) {
            // 创建套餐主体
            $package = MenuPackage::create([
                'name'        => 'Value Combo ' . $index,
                'description' => 'A special value combo package, perfect for sharing.',
                'price'       => rand(5000, 15000) / 100, // 生成 50.00 到 150.00 之间的价格
                'quantity'    => rand(20, 100),
                'status'      => true,
                // 从图片数组中随机选择一个，并加上在 Filament 中设置的目录
                // 正确的路径
                'image'       => 'images/' . Arr::random($availableImages),
            ]);

            // 4. 从已有的菜单中随机选择 2 到 4 个，并附加到这个套餐上
            // 我们确保选择的数量不超过菜单总数
            $menusToAttachCount = min($menus->count(), rand(2, 4));
            $menusToAttach      = $menus->random($menusToAttachCount);

            $package->menus()->attach($menusToAttach->pluck('id'));

            $this->command->info("Created Menu Package: {$package->name} with {$menusToAttachCount} menus.");
        }
    }
}
