<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Menu;
use App\Models\MenuPackage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MenuPackageSeeder extends Seeder
{
    public function run(): void
    {
        $sourceDirectory = 'images';         
        $destinationDirectory = 'menu-packages';

        // 检查源目录
        if (!Storage::disk('public')->exists($sourceDirectory) || empty(Storage::disk('public')->files($sourceDirectory))) {
            $this->command->error("Source directory 'public/storage/{$sourceDirectory}' is missing or empty. Please add images to seed.");
            return;
        }

        // 清理并创建目标目录
        Storage::disk('public')->deleteDirectory($destinationDirectory);
        Storage::disk('public')->makeDirectory($destinationDirectory);
        $this->command->info("Directory 'public/storage/{$destinationDirectory}' has been cleaned and prepared.");

        $availableImagePaths = Storage::disk('public')->files($sourceDirectory);

        $menus = Menu::all();
        $categories = Category::all();

        if ($menus->isEmpty() || $categories->isEmpty()) {
            $this->command->info('No menus or categories found, skipping MenuPackageSeeder.');
            return;
        }

        // 更“真实”的套餐数据
        $packages = [
            [
                'name'        => '商务午餐套餐',
                'category'    => '午餐',
                'description' => '营养均衡的午餐组合，适合上班族。',
            ],
            [
                'name'        => '家庭分享套餐',
                'category'    => '套餐',
                'description' => '适合家庭聚餐的多样化组合。',
            ],
            [
                'name'        => '儿童欢乐套餐',
                'category'    => '儿童餐',
                'description' => '为孩子特别设计的健康美味套餐。',
            ],
            [
                'name'        => '海鲜盛宴',
                'category'    => '海鲜',
                'description' => '精选新鲜海鲜，豪华大餐体验。',
            ],
            [
                'name'        => '甜点下午茶',
                'category'    => '甜点',
                'description' => '搭配甜点与饮品的轻松下午茶套餐。',
            ],
        ];

        foreach ($packages as $index => $item) {
            // 随机选择一张图片
            $randomSourcePath = Arr::random($availableImagePaths);
            $originalFileName = basename($randomSourcePath);
            $newFileName = Str::ulid() . '_' . $originalFileName;
            $dbImagePath = $destinationDirectory . '/' . $newFileName;

            // 复制图片
            Storage::disk('public')->copy($randomSourcePath, $dbImagePath);

            // 确保分类存在
            $category = Category::firstOrCreate(['name' => $item['category']]);

            // 随机价格
            $basePrice = round(rand(8000, 20000) / 100, 2);
            $promotionPrice = (rand(0, 1) === 1) ? round($basePrice * 0.85, 2) : null;

            // 创建套餐
            $package = MenuPackage::create([
                'name'                => $item['name'],
                'category_id'         => $category->id,
                'image'               => $dbImagePath,
                'description'         => $item['description'],
                'base_price'          => $basePrice,
                'promotion_price'     => $promotionPrice,
                'quantity'            => rand(10, 50),
                'menu_package_status' => true,
            ]);

            // 随机附加菜单
            $menusToAttachCount = min($menus->count(), rand(2, 4));
            $menusToAttach = $menus->random($menusToAttachCount);

            if (method_exists($package, 'menus')) {
                $package->menus()->attach($menusToAttach->pluck('id')->all());
                $this->command->info("Created Package: {$package->name} ({$category->name}) with {$menusToAttachCount} menus.");
            } else {
                $this->command->warn("Method menus() does not exist on MenuPackage model. Skipping attachment for {$package->name}.");
            }
        }
    }
}
