<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\MenuPackage;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class MenuPackageController extends Controller
{
    /**
     * 显示所有套餐的列表
     * 这个API是给 PackagesPage 使用的，需要包含所有卡片上显示的信息。
     */
    public function index(): JsonResponse
    {
        // 1. 获取所有激活的套餐，并预加载需要在卡片上显示的关系
        $packages = MenuPackage::with(['category', 'menus:id,name']) // 只加载菜单的id和name即可
            ->withCount('menus')
            ->where('menu_package_status', true) // 使用正确的状态字段
            ->latest()
            ->get(); // 使用 get() 获取所有，如果需要分页再换回 paginate(15)

        // 2. 转换集合中的每一项，以格式化输出
        $transformedPackages = $packages->map(function (MenuPackage $package) {
            return [
                'id' => $package->id,
                'name' => $package->name,
                'description' => $package->description,
                'base_price' => $package->base_price,
                'promotion_price' => $package->promotion_price,
                'quantity' => $package->quantity,
                'status' => $package->menu_package_status,
                // Storage::url() 返回 /storage/path/to/image.jpg
                // 前端需要拼接上域名 http://127.0.0.1:8000
                'image' => $package->image ? Storage::url($package->image) : null,
                'category' => $package->category ? [
                    'id' => $package->category->id,
                    'name' => $package->category->name,
                ] : null,
                'menus' => $package->menus, // 包含菜单的简要列表
                'menus_count' => $package->menus_count,
            ];
        });

        // 3. 返回 JSON 响应 (不使用Laravel分页器时直接返回数组)
        return response()->json($transformedPackages);
    }

    /**
     * 显示单个套餐的完整详细信息 (此方法逻辑正确，无需修改)
     */
    public function show(MenuPackage $menuPackage): JsonResponse
    {
        $menuPackage->load([
            'category',
            'menus' => fn ($query) => $query->where('menu_status', true),
            'menus.addons' => fn ($query) => $query->where('addon_status', true),
            'menus.variants' => fn ($query) => $query->where('variant_status', true),
        ]);

        $formattedData = $this->formatPackageDetails($menuPackage);

        return response()->json([
            'data' => $formattedData,
        ]);
    }

    /**
     * 私有辅助方法，用于格式化套餐的详细信息 (需要更新以使用新字段)
     */
    private function formatPackageDetails(MenuPackage $package): array
    {
        return [
            'id' => $package->id,
            'name' => $package->name,
            'description' => $package->description,
            'base_price' => $package->base_price,
            'promotion_price' => $package->promotion_price,
            'quantity' => $package->quantity,
            'status' => $package->menu_package_status,
            'image' => $package->image ? Storage::url($package->image) : null,
            'category' => $package->category ? [
                'id' => $package->category->id,
                'name' => $package->category->name,
            ] : null,
            'menus' => $package->menus->map(function ($menu) {
                return [
                    'id' => $menu->id,
                    'name' => $menu->name,
                    'base_price' => $menu->base_price,
                    'description' => $menu->description,
                    'addons' => $menu->addons->map(function ($addon) {
                        return [
                            'id' => $addon->id, 'name' => $addon->name, 'price' => (float) $addon->price,
                        ];
                    }),
                    'variants' => $menu->variants->map(function ($variant) {
                        return [
                            'id' => $variant->id, 'name' => $variant->name, 'price_modifier' => (float) $variant->price_modifier,
                        ];
                    }),
                ];
            }),
        ];
    }
}
