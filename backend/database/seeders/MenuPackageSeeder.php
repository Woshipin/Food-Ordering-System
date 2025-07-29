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
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        // --- 1. 定义源和目标目录 (都在 'public' disk 内) ---
        $sourceDirectory = 'images';         // 源目录: public/storage/images
        $destinationDirectory = 'menu-packages'; // 目标目录: public/storage/menu-packages

        // --- 2. 准备工作 ---
        // 检查源目录是否存在且有文件
        if (!Storage::disk('public')->exists($sourceDirectory) || empty(Storage::disk('public')->files($sourceDirectory))) {
            // 使用 $this->command 来输出信息
            $this->command->error("Source directory 'public/storage/{$sourceDirectory}' is missing or empty. Please add images to seed.");
            return;
        }

        // 清理并创建目标目录，以防重复运行seeder
        Storage::disk('public')->deleteDirectory($destinationDirectory);
        Storage::disk('public')->makeDirectory($destinationDirectory);
        // 修正: 使用 -> 访问对象属性
        $this->command->info("Directory 'public/storage/{$destinationDirectory}' has been cleaned and prepared.");

        // 获取源目录中所有文件的文件名
        $availableImagePaths = Storage::disk('public')->files($sourceDirectory);

        // --- 3. 获取其他必要的数据 ---
        $menus = Menu::all();
        $categories = Category::all();

        if ($menus->isEmpty() || $categories->isEmpty()) {
            $this->command->info('No menus or categories found, skipping MenuPackageSeeder.');
            return;
        }

        // --- 4. 循环创建套餐 ---
        foreach (range(1, 10) as $index) {
            // a. 随机选择一个源图片路径
            $randomSourcePath = Arr::random($availableImagePaths);

            // b. 从完整路径中提取原始文件名 (e.g., 'images/beef.jpg' -> 'beef.jpg')
            $originalFileName = basename($randomSourcePath);

            // c. 创建一个新的、唯一的文件名
            $newFileName = Str::ulid() . '_' . $originalFileName;

            // d. 定义数据库中存储的相对路径
            $dbImagePath = $destinationDirectory . '/' . $newFileName;

            // e. 复制文件: Storage::copy('源路径', '目标路径')
            Storage::disk('public')->copy($randomSourcePath, $dbImagePath);

            // --- 数据库记录创建 ---
            $basePrice = round(rand(5000, 15000) / 100, 2);
            $promotionPrice = (rand(0, 1) === 1) ? round($basePrice * 0.8, 2) : null;

            $package = MenuPackage::create([
                'name'              => 'Value Combo ' . $index,
                'category_id'       => $categories->random()->id,
                'image'             => $dbImagePath,
                'description'       => 'A special value combo package, perfect for sharing.',
                'base_price'        => $basePrice,
                'promotion_price'   => $promotionPrice,
                'quantity'          => rand(20, 100),
                'menu_package_status'            => true,
            ]);

            // --- 附加菜单关系 ---
            $menusToAttachCount = min($menus->count(), rand(2, 4));
            $menusToAttach      = $menus->random($menusToAttachCount);

            if (method_exists($package, 'menus')) {
                $package->menus()->attach($menusToAttach->pluck('id')->all());
                // 修正: 使用 -> 访问对象属性
                $this->command->info("Created Package: {$package->name} with image '{$newFileName}' and {$menusToAttachCount} menus.");
            } else {
                // 修正: 使用 -> 访问对象属性
                $this->command->warn("Method menus() does not exist on MenuPackage model. Skipping attachment for {$package->name}.");
            }
        }
    }
}
