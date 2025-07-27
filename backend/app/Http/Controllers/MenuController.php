<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class MenuController extends Controller
{
    /**
     * Display a listing of the menus.
     *
     * GET /api/menus
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(): JsonResponse
    {
        // Retrieve all menus without pagination
        $menus = Menu::with('category', 'images')
            ->where('menu_status', true)
            ->latest()
            ->get();

        // Transform the collection
        $transformedMenus = $menus->map(function (Menu $menu) {
            return [
                'id' => $menu->id,
                'name' => $menu->name,
                'description' => $menu->description,
                'base_price' => (float) $menu->base_price,
                'promotion_price' => $menu->promotion_price ? (float) $menu->promotion_price : null,
                'status' => $menu->menu_status,
                'images' => $menu->images->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'url' => Storage::url($image->image_path),
                    ];
                }),
                'category' => $menu->category ? [
                    'id' => $menu->category->id,
                    'name' => $menu->category->name,
                ] : null,
            ];
        });

        // Return a JSON response
        return response()->json($transformedMenus);
    }

    /**
     * Display the specified menu.
     *
     * GET /api/menus/{menu}
     *
     * @param \App\Models\Menu $menu
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Menu $menu): JsonResponse
    {
        $menu->load([
            'category',
            'images',
            'addons' => fn ($query) => $query->where('addon_status', true),
            'variants' => fn ($query) => $query->where('variant_status', true),
        ]);
        $formattedData = $this->formatMenuDetails($menu);
        return response()->json([
            'data' => $formattedData,
        ]);
    }

    /**
     * Private helper method to format menu details.
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
            'category' => $menu->category ? [
                'id' => $menu->category->id,
                'name' => $menu->category->name,
            ] : null,
            'images' => $menu->images->map(function ($image) {
                return [
                    'id' => $image->id,
                    'url' => Storage::url($image->image_path),
                ];
            }),
            'addons' => $menu->addons->map(function ($addon) {
                return [
                    'id' => $addon->id,
                    'name' => $addon->name,
                    'price' => isset($addon->price) ? (float) $addon->price : 0.0,
                ];
            }),
            'variants' => $menu->variants->map(function ($variant) {
                return [
                    'id' => $variant->id,
                    'name' => $variant->name,
                    'price_modifier' => isset($variant->price_modifier) ? (float) $variant->price_modifier : 0.0,
                ];
            }),
        ];
    }
}
