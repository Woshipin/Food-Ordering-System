<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class MenuController extends Controller
{
    /**
     * 显示菜单列表 (分页)
     * GET /api/menus
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(): JsonResponse
    {
        // 1. 高效获取分页数据，并预加载列表页需要的基本关联数据
        $menusPaginator = Menu::with('category', 'images')
            ->latest()
            ->paginate(15);

        // 2. 使用 'through' 方法来转换分页集合中的每一项数据
        // 这可以在不破坏分页结构的情况下，格式化每个菜单的输出
        $transformedMenus = $menusPaginator->through(function (Menu $menu) {
            return [
                'id' => $menu->id,
                'name' => $menu->name,
                'base_price' => (float) $menu->base_price,
                'promotion_price' => $menu->promotion_price ? (float) $menu->promotion_price : null,
                'status' => $menu->menu_status,
                // 提供主图的完整 URL，方便前端直接使用
                'main_image_url' => $menu->images->first() ? Storage::url($menu->images->first()->image_path) : null,
                'category' => $menu->category ? [
                    'id' => $menu->category->id,
                    'name' => $menu->category->name,
                ] : null,
            ];
        });

        // 3. 返回标准的、包含分页信息的 JSON 响应
        return response()->json($transformedMenus);
    }

    /**
     * 显示单个菜单的完整详细信息
     * GET /api/menus/{menu}
     *
     * @param \App\Models\Menu $menu Laravel的路由模型绑定会自动注入Menu实例
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Menu $menu): JsonResponse
    {
        // 1. 路由模型绑定已为我们获取了$menu，现在加载所有需要的关联关系
        $menu->load('category', 'images', 'addons', 'variants');

        // 2. 使用私有辅助方法来格式化输出，保持此方法整洁
        $formattedData = $this->formatMenuDetails($menu);

        // 3. 返回被 'data' 键包裹的单个对象，与列表接口保持一致性
        return response()->json([
            'data' => $formattedData,
        ]);
    }

    /**
     * 私有辅助方法，用于将单个Menu模型格式化为详细的数组。
     * 这种方式将格式化逻辑从主方法中分离出来，使代码更清晰。
     *
     * @param \App\Models\Menu $menu
     * @return array
     */
    private function formatMenuDetails(Menu $menu): array
    {
        return [
            'id' => $menu->id,
            'name' => $menu->name,
            'description' => $menu->description,
            'base_price' => (float) $menu->base_price,
            'promotion_price' => $menu->promotion_price ? (float) $menu->promotion_price : null,
            'is_on_promotion' => !is_null($menu->promotion_price),
            'status' => $menu->menu_status,

            // 关联数据格式化
            'category' => $menu->category ? [
                'id' => $menu->category->id,
                'name' => $menu->category->name,
            ] : null,

            // 格式化图片，提供完整的 URL
            'images' => $menu->images->map(function ($image) {
                return [
                    'id' => $image->id,
                    'url' => Storage::url($image->image_path), // 生成可访问的URL
                ];
            }),

            // 格式化附加项 (Addons)
            'addons' => $menu->addons->map(function ($addon) {
                return [
                    'id' => $addon->id,
                    'name' => $addon->name,
                    // 假设 Addon 模型有 'price' 字段
                    'price' => isset($addon->price) ? (float) $addon->price : 0.0,
                ];
            }),

            // 格式化规格 (Variants)
            'variants' => $menu->variants->map(function ($variant) {
                return [
                    'id' => $variant->id,
                    'name' => $variant->name,
                     // 假设 Variant 模型有 'price_modifier' 字段
                    'price_modifier' => isset($variant->price_modifier) ? (float) $variant->price_modifier : 0.0,
                ];
            }),
        ];
    }
}
