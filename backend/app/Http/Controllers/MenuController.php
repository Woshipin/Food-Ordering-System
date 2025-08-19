<?php

namespace App\Http\Controllers;

use App\Http\Resources\MenuApiResource;
use App\Models\Menu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MenuController extends Controller
{
    /**
     * 显示菜单列表。
     * Display a listing of the menus.
     *
     * GET /api/menus
     *
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index(): AnonymousResourceCollection
    {
        // 预加载 category 和 images 关系，以避免 N+1 查询问题，提升性能。
        $menus = Menu::with('category', 'images')
            ->where('menu_status', true) // 只获取状态为 true (启用) 的菜单。
            ->latest() // 按创建时间的倒序来排序，最新的菜单会排在最前面。
            ->get();

        // 使用 MenuApiResource 集合来统一格式化菜单列表的 JSON 输出。
        return MenuApiResource::collection($menus);
    }

    /**
     * 显示指定的菜单详情。
     * Display the specified menu.
     *
     * GET /api/menus/{menu}
     *
     * @param \App\Models\Menu $menu
     * @return \App\Http\Resources\MenuApiResource
     */
    public function show(Menu $menu): MenuApiResource
    {
        // 加载单个菜单的详细关联数据。
        $menu->load([
            'category', // 加载分类信息
            'images', // 加载图片信息
            'addons' => fn ($query) => $query->where('addon_status', true), // 仅加载状态为启用的附加项
            'variants' => fn ($query) => $query->where('variant_status', true), // 仅加载状态为启用的规格
        ]);

        // 使用 MenuApiResource 来格式化单个菜单的 JSON 输出。
        return new MenuApiResource($menu);
    }
}
