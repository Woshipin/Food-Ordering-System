<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MenuPackage;
use App\Models\Menu;
use App\Models\Addon;
use App\Models\Variant;
use App\Models\Cart;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class CartController extends Controller
{
    /**
     * 获取或创建用户的购物车，此操作在数据库事务中进行以确保原子性。
     * @return Cart
     */
    private function getOrCreateCart()
    {
        $user = auth()->user();
        // 使用事务来安全地获取或创建购物车
        return DB::transaction(function () use ($user) {
            // 查找用户的购物车并锁定该行，防止其他并发事务进行修改
            $cart = Cart::where('user_id', $user->id)
                ->where('is_checked_out', false)
                ->lockForUpdate()
                ->first();

            // 如果找不到购物车，则创建一个新的
            if (!$cart) {
                $cart = Cart::create([
                    'user_id' => $user->id,
                    'is_checked_out' => false
                ]);
            }

            return $cart;
        });
    }

    /**
     * 将单个菜单项添加到购物车，整个过程使用事务和锁来处理并发。
     */
    public function addMenuItem(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'menu_id' => 'required|integer',
            'menu_name' => 'required|string',
            'base_price' => 'required|numeric',
            'quantity' => 'required|integer|min:1',
            'addons' => 'sometimes|array',
            'variants' => 'sometimes|array',
            'image_url' => 'nullable|string',
            'category_name' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        try {
            $cart = DB::transaction(function () use ($request) {
                $cart = $this->getOrCreateCart(); // getOrCreateCart 内部已经有事务和锁

                $menuItem = $cart->menuItems()->create($request->only([
                    'menu_id', 'menu_name', 'menu_description', 'base_price',
                    'promotion_price', 'quantity', 'image_url', 'category_name'
                ]));

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

                // 返回加载了最新数据的购物车
                return $cart->load('menuItems.addons', 'menuItems.variants', 'packageItems.menus.addons', 'packageItems.menus.variants');
            });

            return response()->json(['message' => 'Menu item added to cart', 'cart' => $cart]);

        } catch (Throwable $e) {
            Log::error('Failed to add menu item to cart: ' . $e->getMessage());
            return response()->json(['message' => 'An error occurred while adding the item to the cart.'], 500);
        }
    }

    /**
     * 将套餐添加到购物车，整个过程使用事务和锁来处理并发。
     */
    public function addPackageItem(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'menu_package_id' => 'required|exists:menu_packages,id',
            'quantity' => 'required|integer|min:1',
            'options' => 'present|array',
            'options.menus' => 'present|array',
            'options.menus.*.menu_id' => 'required|exists:menus,id',
            'options.menus.*.variant_id' => 'nullable|exists:variants,id',
            'options.menus.*.addon_ids' => 'present|array',
            'options.menus.*.addon_ids.*' => 'integer|exists:addons,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        try {
            DB::transaction(function () use ($request) {
                $cart = $this->getOrCreateCart();
                $package = MenuPackage::findOrFail($request->input('menu_package_id'));
                $quantity = $request->input('quantity');
                $options = $request->input('options');

                $unitPrice = $package->promotion_price > 0 ? $package->promotion_price : $package->base_price;
                $optionsPrice = 0;

                foreach ($options['menus'] as $menuOption) {
                    if (!empty($menuOption['variant_id'])) {
                        $optionsPrice += Variant::find($menuOption['variant_id'])->price_modifier ?? 0;
                    }
                    if (!empty($menuOption['addon_ids'])) {
                        $optionsPrice += Addon::whereIn('id', $menuOption['addon_ids'])->sum('price');
                    }
                }
                $finalUnitPrice = $unitPrice + $optionsPrice;

                $packageItem = $cart->packageItems()->create([
                    'menu_package_id' => $package->id,
                    'package_name' => $package->name,
                    'package_description' => $package->description,
                    'package_price' => $finalUnitPrice,
                    'quantity' => $quantity,
                    'package_image' => $package->image,
                    'category_name' => $package->category->name ?? null,
                ]);

                foreach ($options['menus'] as $menuOption) {
                    $menu = Menu::find($menuOption['menu_id']);
                    if (!$menu) continue;

                    $packageMenu = $packageItem->menus()->create([
                        'menu_id' => $menu->id,
                        'menu_name' => $menu->name,
                        'menu_description' => $menu->description,
                        'base_price' => $menu->base_price,
                        'quantity' => 1,
                    ]);

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
            });

            return response()->json(['message' => 'Package item added to cart successfully!'], 201);

        } catch (Throwable $e) {
            Log::error('Failed to add package item to cart: ' . $e->getMessage());
            return response()->json(['message' => 'An error occurred while adding the package to the cart.'], 500);
        }
    }

    /**
     * 获取当前用户的购物车内容。
     */
    public function getCart()
    {
        $cart = Cart::with('menuItems.addons', 'menuItems.variants', 'packageItems.menus.addons', 'packageItems.menus.variants')
            ->where('user_id', auth()->id())
            ->where('is_checked_out', false)
            ->first();

        return response()->json(['cart' => $cart]);
    }

    /**
     * 清空购物车，此操作在事务中进行以确保原子性。
     */
    public function clearCart()
    {
        try {
            DB::transaction(function () {
                $cart = Cart::where('user_id', auth()->id())
                    ->where('is_checked_out', false)
                    ->lockForUpdate() // 在清空前锁定购物车
                    ->first();

                if ($cart) {
                    // 使用关系删除，比 each 高效
                    $cart->menuItems()->delete();
                    $cart->packageItems()->delete();
                    $cart->delete();
                }
            });

            return response()->json(['message' => 'Cart cleared']);

        } catch (Throwable $e) {
            Log::error('Failed to clear cart: ' . $e->getMessage());
            return response()->json(['message' => 'An error occurred while clearing the cart.'], 500);
        }
    }
}
