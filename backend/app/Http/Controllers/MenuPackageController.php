<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\MenuPackage;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class MenuPackageController extends Controller
{
    /**
     * 显示所有套餐的列表 (分页)
     * GET /api/menu-packages
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(): JsonResponse
    {
        // 1. 获取分页数据，并使用 withCount 高效获取每个套餐包含的菜单数量
        $packagesPaginator = MenuPackage::withCount('menus')
            ->latest()
            ->paginate(15);

        // 2. 转换分页集合中的每一项，以格式化输出
        $transformedPackages = $packagesPaginator->through(function (MenuPackage $package) {
            return [
                'id' => $package->id,
                'name' => $package->name,
                'price' => (float) $package->price,
                'quantity' => $package->quantity,
                'status' => $package->status,
                'image_url' => $package->image ? Storage::url($package->image) : null,
                'menu_count' => $package->menus_count, // withCount 会自动添加 `menus_count` 属性
            ];
        });

        // 3. 返回标准的分页 JSON 响应
        return response()->json($transformedPackages);
    }

    /**
     * 显示单个套餐的完整详细信息，包括其所有菜单及菜单的附加项和规格
     * GET /api/menu-packages/{menu_package}
     *
     * @param \App\Models\MenuPackage $menuPackage Laravel路由模型绑定
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(MenuPackage $menuPackage): JsonResponse
    {
        // 1. 这是此功能最关键的一步：
        // 使用点(.)语法进行深度预加载 (Nested Eager Loading)
        // 这会一次性加载套餐的所有菜单，以及每个菜单的所有附加项和规格
        $menuPackage->load('menus.addons', 'menus.variants');

        // 2. 使用私有辅助方法格式化详细数据
        $formattedData = $this->formatPackageDetails($menuPackage);

        // 3. 返回被 'data' 键包裹的 JSON 响应
        return response()->json([
            'data' => $formattedData,
        ]);
    }

    /**
     * 私有辅助方法，用于格式化套餐的详细信息
     *
     * @param \App\Models\MenuPackage $package
     * @return array
     */
    private function formatPackageDetails(MenuPackage $package): array
    {
        return [
            'id' => $package->id,
            'name' => $package->name,
            'description' => $package->description,
            'price' => (float) $package->price,
            'quantity' => $package->quantity,
            'status' => $package->status,
            'image_url' => $package->image ? Storage::url($package->image) : null,

            // 格式化套餐中包含的所有菜单
            'menus' => $package->menus->map(function ($menu) {
                return [
                    'id' => $menu->id,
                    'name' => $menu->name,
                    'base_price' => (float) $menu->base_price,
                    'description' => $menu->description,

                    // 格式化每个菜单的附加项 (Addons)
                    'addons' => $menu->addons->map(function ($addon) {
                        return [
                            'id' => $addon->id,
                            'name' => $addon->name,
                            'price' => isset($addon->price) ? (float) $addon->price : 0.0,
                        ];
                    }),

                    // 格式化每个菜单的规格 (Variants)
                    'variants' => $menu->variants->map(function ($variant) {
                        return [
                            'id' => $variant->id,
                            'name' => $variant->name,
                            'price_modifier' => isset($variant->price_modifier) ? (float) $variant->price_modifier : 0.0,
                        ];
                    }),
                ];
            }),
        ];
    }
}
