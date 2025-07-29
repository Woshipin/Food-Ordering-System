<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MenuPackage;
use App\Models\Menu;
use App\Models\Addon;
use App\Models\Variant;
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
            'image_url' => 'nullable|string',
            'category_name' => 'nullable|string',
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
            'image_url' => $request->image_url,
            'category_name' => $request->category_name,
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
        // 1. 更新验证规则，只接收必要的信息
        $validator = Validator::make($request->all(), [
            'menu_package_id' => 'required|exists:menu_packages,id',
            'quantity'        => 'required|integer|min:1',
            'options'         => 'present|array', // 'present' 确保 options 键存在，即使为空数组
            'options.menus'   => 'present|array',
            'options.menus.*.menu_id' => 'required|exists:menus,id',
            'options.menus.*.variant_id' => 'nullable|exists:variants,id',
            'options.menus.*.addon_ids' => 'present|array',
            'options.menus.*.addon_ids.*' => 'integer|exists:addons,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $cart = $this->getOrCreateCart();
        $packageId = $request->input('menu_package_id');
        $quantity = $request->input('quantity');
        $options = $request->input('options');

        // 2. 从数据库获取套餐的权威信息
        $package = MenuPackage::findOrFail($packageId);

        // 3. 在服务器端重新计算总价，防止篡改
        $unitPrice = ($package->promotion_price > 0) ? $package->promotion_price : $package->base_price;

        $optionsPrice = 0;
        foreach ($options['menus'] as $menuOption) {
            if (!empty($menuOption['variant_id'])) {
                $variant = Variant::find($menuOption['variant_id']);
                if ($variant) {
                    $optionsPrice += $variant->price_modifier;
                }
            }
            if (!empty($menuOption['addon_ids'])) {
                $optionsPrice += Addon::whereIn('id', $menuOption['addon_ids'])->sum('price');
            }
        }
        $finalUnitPrice = $unitPrice + $optionsPrice;

        // 4. 创建购物车中的套餐主项
        $packageItem = $cart->packageItems()->create([
            'menu_package_id'   => $package->id,
            'package_name'      => $package->name,
            'package_description' => $package->description,
            'package_price'     => $finalUnitPrice, // 使用服务器计算的价格
            'quantity'          => $quantity,
            'package_image'     => $package->image,
            'category_name'     => $package->category->name ?? null,
        ]);

        // 5. 循环创建套餐内的菜单项及其选项
        foreach ($options['menus'] as $menuOption) {
            $menu = Menu::find($menuOption['menu_id']);
            if (!$menu) continue;

            $packageMenu = $packageItem->menus()->create([
                'menu_id'         => $menu->id,
                'menu_name'       => $menu->name,
                'menu_description'=> $menu->description,
                'base_price'      => $menu->base_price,
                'quantity'        => 1, // 套餐内子菜单数量总是1
            ]);

            // 添加 variant
            if (!empty($menuOption['variant_id'])) {
                $variant = Variant::find($menuOption['variant_id']);
                if ($variant) {
                    $packageMenu->variants()->create([
                        'variant_id' => $variant->id,
                        'variant_name' => $variant->name,
                        'variant_price' => $variant->price_modifier,
                    ]);
                }
            }

            // 添加 addons
            if (!empty($menuOption['addon_ids'])) {
                $addons = Addon::whereIn('id', $menuOption['addon_ids'])->get();
                foreach ($addons as $addon) {
                     $packageMenu->addons()->create([
                        'addon_id' => $addon->id,
                        'addon_name' => $addon->name,
                        'addon_price' => $addon->price,
                    ]);
                }
            }
        }

        return response()->json(['message' => 'Package item added to cart successfully!'], 201);
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

