<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\CartMenuItem;
use App\Models\CartMenuItemAddon;
use App\Models\CartMenuItemVariant;
use App\Models\CartPackageItem;
use App\Models\CartPackageItemMenu;
use App\Models\CartPackageItemMenuAddon;
use App\Models\CartPackageItemMenuVariant;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    // 获取或创建购物车
    private function getOrCreateCart()
    {
        return Cart::firstOrCreate([
            'user_id' => auth()->id(),
            'is_checked_out' => false
        ]);
    }

    // 添加菜单项到购物车
    public function addMenuItem(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'menu_id' => 'required|integer',
            'menu_name' => 'required|string',
            'base_price' => 'required|numeric',
            'quantity' => 'required|integer|min:1',
            'addons' => 'array',
            'variants' => 'array',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $cart = $this->getOrCreateCart();

        $menuItem = $cart->menuItems()->create([
            'menu_id' => $request->menu_id,
            'menu_name' => $request->menu_name,
            'menu_description' => $request->menu_description,
            'base_price' => $request->base_price,
            'promotion_price' => $request->promotion_price,
            'quantity' => $request->quantity,
        ]);

        if ($request->has('addons')) {
            foreach ($request->addons as $addon) {
                $menuItem->addons()->create($addon);
            }
        }

        if ($request->has('variants')) {
            foreach ($request->variants as $variant) {
                $menuItem->variants()->create($variant);
            }
        }

        return response()->json(['message' => 'Menu item added to cart', 'cart' => $cart->load('menuItems.addons', 'menuItems.variants', 'packageItems.menus.addons', 'packageItems.menus.variants')]);
    }

    // 添加套餐项到购物车
    public function addPackageItem(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'menu_package_id' => 'required|integer',
            'package_name' => 'required|string',
            'package_price' => 'required|numeric',
            'quantity' => 'required|integer|min:1',
            'menus' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $cart = $this->getOrCreateCart();

        $packageItem = $cart->packageItems()->create([
            'menu_package_id' => $request->menu_package_id,
            'package_name' => $request->package_name,
            'package_description' => $request->package_description,
            'package_price' => $request->package_price,
            'quantity' => $request->quantity,
        ]);

        foreach ($request->menus as $menu) {
            $packageMenu = $packageItem->menus()->create([
                'menu_id' => $menu['menu_id'],
                'menu_name' => $menu['menu_name'],
                'menu_description' => $menu['menu_description'],
                'base_price' => $menu['base_price'],
                'promotion_price' => $menu['promotion_price'],
                'quantity' => $menu['quantity'] ?? 1,
            ]);

            if (isset($menu['addons'])) {
                foreach ($menu['addons'] as $addon) {
                    $packageMenu->addons()->create($addon);
                }
            }

            if (isset($menu['variants'])) {
                foreach ($menu['variants'] as $variant) {
                    $packageMenu->variants()->create($variant);
                }
            }
        }

        return response()->json(['message' => 'Package item added to cart', 'cart' => $cart->load('menuItems.addons', 'menuItems.variants', 'packageItems.menus.addons', 'packageItems.menus.variants')]);
    }

    // 获取当前购物车
    public function getCart()
    {
        $cart = Cart::with('menuItems.addons', 'menuItems.variants', 'packageItems.menus.addons', 'packageItems.menus.variants')
            ->where('user_id', auth()->id())
            ->where('is_checked_out', false)
            ->first();

        return response()->json(['cart' => $cart]);
    }

    // 清空购物车
    public function clearCart()
    {
        $cart = Cart::where('user_id', auth()->id())->where('is_checked_out', false)->first();
        if ($cart) {
            // Manually delete related items to trigger model events if any.
            $cart->menuItems()->each(function ($item) {
                $item->addons()->delete();
                $item->variants()->delete();
                $item->delete();
            });
            $cart->packageItems()->each(function ($item) {
                $item->menus()->each(function ($menu) {
                    $menu->addons()->delete();
                    $menu->variants()->delete();
                    $menu->delete();
                });
                $item->delete();
            });
            $cart->delete();
        }
        return response()->json(['message' => 'Cart cleared']);
    }
}

