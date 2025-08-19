<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Cart;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;
use Illuminate\Support\Facades\Log; // 引入 Log Facade

class OrderController extends Controller
{
    /**
     * Store a newly created order in storage.
     */
    public function store(Request $request)
    {
        // --- 用户认证 ---
        $user = auth('api')->user();
        if (!$user) {
            return response()->json(['message' => 'User not authenticated'], 401);
        }

        // --- 请求验证 ---
        $validated = $request->validate([
            'service_method_name' => 'required|string',
            'payment_method_name' => 'required|string',
            'address_id' => 'nullable|integer|exists:addresses,id,user_id,' . $user->id,
            'pickup_time' => 'nullable|date_format:Y-m-d\TH:i',
            'special_instructions' => 'nullable|string|max:1000',
            'promo_code' => 'nullable|string',
            'delivery_fee' => 'required|numeric|min:0',
            'discount_amount' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
        ]);

        // --- 获取购物车 ---
        // 在启动事务前先获取购物车，以便在事务闭包中使用
        $cart = Cart::with([
            'menuItems.addons',
            'menuItems.variants',
            'packageItems.menus.addons',
            'packageItems.menus.variants',
        ])->where('user_id', $user->id)->first();

        // --- 检查购物车是否为空 ---
        if (!$cart || ($cart->menuItems->isEmpty() && $cart->packageItems->isEmpty())) {
            return response()->json(['message' => 'Your cart is empty.'], 400);
        }

        // --- 启动数据库事务处理订单创建 ---
        try {
            $order = DB::transaction(function () use ($user, $cart, $validated) {
                // --- 悲观锁定购物车 ---
                // 在事务内部，锁定购物车以防止并发请求同时处理。
                $cartLocked = Cart::where('id', $cart->id)->lockForUpdate()->first();

                // --- 再次检查购物车 ---
                // 获取锁后再次检查，确保在等待锁期间购物车未被其他进程清空。
                if (!$cartLocked || ($cartLocked->menuItems->isEmpty() && $cartLocked->packageItems->isEmpty())) {
                    // 如果购物车变空，抛出异常以回滚事务。
                    throw new \Exception('Cart has been cleared while processing.');
                }

                // --- 1. 创建主订单记录 ---
                $orderData = [
                    'user_id' => $user->id,
                    'order_number' => 'ORD-' . now()->timestamp . strtoupper(Str::random(6)),
                    'status' => 'pending',
                    'payment_status' => 'unpaid',
                    'service_method' => $validated['service_method_name'],
                    'payment_method' => $validated['payment_method_name'],
                    'subtotal' => $validated['subtotal'],
                    'delivery_fee' => $validated['delivery_fee'],
                    'discount_amount' => $validated['discount_amount'],
                    'total_amount' => $validated['total_amount'],
                    'promo_code' => $validated['promo_code'] ?? null,
                    'special_instructions' => $validated['special_instructions'] ?? null,
                    'pickup_time' => $validated['pickup_time'] ?? null,
                ];

                // 如果是外卖订单，快照地址信息。
                if ($validated['service_method_name'] === 'delivery' && !empty($validated['address_id'])) {
                    $address = Address::find($validated['address_id']);
                    if ($address) {
                        $orderData['delivery_name'] = $address->name;
                        $orderData['delivery_phone'] = $address->phone;
                        $orderData['delivery_address'] = $address->address;
                        $orderData['delivery_building'] = $address->building;
                        $orderData['delivery_floor'] = $address->floor;
                    }
                }

                $order = Order::create($orderData);

                // --- 2. 处理并快照独立菜单项 ---
                foreach ($cartLocked->menuItems as $cartMenuItem) {
                    $addonsPrice = $cartMenuItem->addons->sum('addon_price');
                    $variantsPrice = $cartMenuItem->variants->sum('variant_price');
                    $singleItemPrice = ($cartMenuItem->promotion_price ?? $cartMenuItem->base_price) + $addonsPrice + $variantsPrice;
                    $itemTotal = $singleItemPrice * $cartMenuItem->quantity;

                    $orderMenuItem = $order->menuItems()->create([
                        'menu_id' => $cartMenuItem->menu_id,
                        'menu_name' => $cartMenuItem->menu_name,
                        'menu_description' => $cartMenuItem->menu_description,
                        'image_url' => $cartMenuItem->image_url,
                        'category_name' => $cartMenuItem->category_name,
                        'base_price' => $cartMenuItem->base_price,
                        'promotion_price' => $cartMenuItem->promotion_price,
                        'quantity' => $cartMenuItem->quantity,
                        'item_total' => $itemTotal,
                    ]);

                    foreach ($cartMenuItem->addons as $addon) {
                        $orderMenuItem->addons()->create($addon->only(['addon_id', 'addon_name', 'addon_price']));
                    }

                    foreach ($cartMenuItem->variants as $variant) {
                        $orderMenuItem->variants()->create($variant->only(['variant_id', 'variant_name', 'variant_price']));
                    }
                }

                // --- 3. 处理并快照套餐项 ---
                foreach ($cartLocked->packageItems as $cartPackageItem) {
                    $packageExtrasTotal = 0;
                    foreach ($cartPackageItem->menus as $packageMenu) {
                        $packageExtrasTotal += $packageMenu->addons->sum('addon_price');
                        $packageExtrasTotal += $packageMenu->variants->sum('variant_price');
                    }
                    $singlePackagePrice = ($cartPackageItem->package_price ?? 0) + $packageExtrasTotal;
                    $packageTotal = $singlePackagePrice * $cartPackageItem->quantity;

                    $orderPackageItem = $order->packageItems()->create([
                        'menu_package_id' => $cartPackageItem->menu_package_id,
                        'package_name' => $cartPackageItem->package_name,
                        'package_description' => $cartPackageItem->package_description,
                        'package_price' => $cartPackageItem->package_price,
                        'package_image' => $cartPackageItem->package_image,
                        'category_name' => $cartPackageItem->category_name,
                        'quantity' => $cartPackageItem->quantity,
                        'item_total' => $packageTotal,
                    ]);

                    foreach ($cartPackageItem->menus as $packageMenu) {
                        $orderPackageItemMenu = $orderPackageItem->menus()->create($packageMenu->only(['menu_id', 'menu_name', 'menu_description', 'base_price', 'promotion_price', 'quantity']));

                        foreach ($packageMenu->addons as $addon) {
                            $orderPackageItemMenu->addons()->create($addon->only(['addon_id', 'addon_name', 'addon_price']));
                        }

                        foreach ($packageMenu->variants as $variant) {
                            $orderPackageItemMenu->variants()->create($variant->only(['variant_id', 'variant_name', 'variant_price']));
                        }
                    }
                }

                // --- 4. 清空购物车 ---
                // $cartLocked->menuItems()->delete();
                // $cartLocked->packageItems()->delete();

                return $order;
            });

            // --- 事务成功，返回成功响应 ---
            return response()->json([
                'message' => 'Order placed successfully!',
                'order' => $order->load(['menuItems.addons', 'menuItems.variants', 'packageItems.menus.addons', 'packageItems.menus.variants'])
            ], 201);

        } catch (Throwable $e) {
            // --- 事务失败，回滚并记录错误 ---
            Log::error('Order creation failed: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Failed to place order. Please try again later.'], 500);
        }
    }

    /**
     * Display a listing of the user's orders.
     */
    public function index()
    {
        $user = auth('api')->user();
        $orders = Order::where('user_id', $user->id)
            ->with([
                'menuItems.addons',
                'menuItems.variants',
                'packageItems.menus.addons',
                'packageItems.menus.variants'
            ])
            ->latest()
            ->get();
        return response()->json($orders);
    }

    /**
     * Display the specified order.
     */
    public function show(Order $order)
    {
        $user = auth('api')->user();
        if ($order->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $order->load([
            'menuItems.addons',
            'menuItems.variants',
            'packageItems.menus.addons',
            'packageItems.menus.variants'
        ]);
        return response()->json($order);
    }
}
