<?php

namespace App\Http\Controllers;

use App\Http\Resources\MenuPackageApiResource;
use App\Models\MenuPackage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MenuPackageController extends Controller
{
    /**
     * 显示所有套餐的列表。
     * Display a listing of the menu packages.
     *
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index(): AnonymousResourceCollection
    {
        // 1. 获取所有状态为启用的套餐
        $packages = MenuPackage::with([
                // 预加载分类信息
                'category',
                // 预加载套餐内的菜单，但只选择 id 和 name 字段以提高效率
                'menus:id,name'
            ])
            // 统计每个套餐包含的菜单数量
            ->withCount('menus')
            // 筛选出状态为启用的套餐
            ->where('menu_package_status', true)
            // 按最新创建的顺序排序
            ->latest()
            // 获取所有结果
            ->get();

        // 2. 使用 MenuPackageApiResource 集合来格式化数据并返回 JSON 响应
        return MenuPackageApiResource::collection($packages);
    }

    /**
     * 显示单个套餐的完整详细信息。
     * Display the specified menu package.
     *
     * @param \App\Models\MenuPackage $menuPackage
     * @return \App\Http\Resources\MenuPackageApiResource
     */
    public function show(MenuPackage $menuPackage): MenuPackageApiResource
    {
        // 1. 加载套餐的深度关联关系
        $menuPackage->load([
            // 加载分类
            'category',
            // 加载状态为启用的菜单
            'menus' => fn ($query) => $query->where('menu_status', true),
            // 在已加载的菜单中，进一步加载其状态为启用的附加项
            'menus.addons' => fn ($query) => $query->where('addon_status', true),
            // 在已加载的菜单中，进一步加载其状态为启用的规格
            'menus.variants' => fn ($query) => $query->where('variant_status', true),
        ]);

        // 2. 使用 MenuPackageApiResource 来格式化单个套餐的数据并返回 JSON 响应
        return new MenuPackageApiResource($menuPackage);
    }
}
