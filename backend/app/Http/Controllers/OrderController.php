<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Cart;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class OrderController extends Controller
{
    /**
     * Store a newly created order in storage.
     */
    public function store(Request $request)
    {
        $user = auth('api')->user();
        if (!$user) {
            return response()->json(['message' => 'User not authenticated'], 401);
        }

        // Validate the incoming request data
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

        // Fetch the user's cart with all nested relationships
        $cart = Cart::with([
            'menuItems.addons',
            'menuItems.variants',
            'packageItems.menus.addons',
            'packageItems.menus.variants',
        ])->where('user_id', $user->id)->first();

        if (!$cart || ($cart->menuItems->isEmpty() && $cart->packageItems->isEmpty())) {
            return response()->json(['message' => 'Your cart is empty.'], 400);
        }

        DB::beginTransaction();

        try {
            // --- 1. Create the Main Order Record ---
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

            // Snapshot address details if it's a delivery order
            if ($validated['service_method_name'] === 'delivery' && !empty($validated['address_id'])) {
                $address = Address::find($validated['address_id']);
                if ($address) {
                    $orderData['delivery_name'] = $address->name;
                    $orderData['delivery_phone'] = $address->phone;
                    $orderData['delivery_address'] = $address->address;
                    $orderData['delivery_building'] = $address->building;
                    $orderData['delivery_floor'] = $address->floor;
                    $orderData['delivery_latitude'] = $address->latitude;
                    $orderData['delivery_longitude'] = $address->longitude;
                }
            }

            $order = Order::create($orderData);

            // --- 2. Process and Snapshot Individual Menu Items ---
            foreach ($cart->menuItems as $cartMenuItem) {
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
                    $orderMenuItem->addons()->create([
                        'addon_id' => $addon->addon_id,
                        'addon_name' => $addon->addon_name,
                        'addon_price' => $addon->addon_price,
                    ]);
                }

                foreach ($cartMenuItem->variants as $variant) {
                    $orderMenuItem->variants()->create([
                        'variant_id' => $variant->variant_id,
                        'variant_name' => $variant->variant_name,
                        'variant_price' => $variant->variant_price,
                    ]);
                }
            }

            // --- 3. Process and Snapshot Package Items ---
            foreach ($cart->packageItems as $cartPackageItem) {
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
                    $orderPackageItemMenu = $orderPackageItem->menus()->create([
                        'menu_id' => $packageMenu->menu_id,
                        'menu_name' => $packageMenu->menu_name,
                        'menu_description' => $packageMenu->menu_description,
                        'base_price' => $packageMenu->base_price,
                        'promotion_price' => $packageMenu->promotion_price,
                        'quantity' => $packageMenu->quantity,
                    ]);

                    foreach ($packageMenu->addons as $addon) {
                        $orderPackageItemMenu->addons()->create([
                            'addon_id' => $addon->addon_id,
                            'addon_name' => $addon->addon_name,
                            'addon_price' => $addon->addon_price,
                        ]);
                    }

                    foreach ($packageMenu->variants as $variant) {
                        $orderPackageItemMenu->variants()->create([
                            'variant_id' => $variant->variant_id,
                            'variant_name' => $variant->variant_name,
                            'variant_price' => $variant->variant_price,
                        ]);
                    }
                }
            }

            // --- 4. Clean Up and Finalize ---
            // This is important for a real application to clear the cart after ordering.
            $cart->delete();

            DB::commit();

            return response()->json([
                'message' => 'Order placed successfully!',
                'order' => $order->load(['menuItems.addons', 'menuItems.variants', 'packageItems.menus.addons', 'packageItems.menus.variants'])
            ], 201);

        } catch (Throwable $e) {
            DB::rollBack();
            report($e);
            return response()->json(['message' => 'Failed to place order. Please try again later.'], 500);
        }
    }

    /**
     * Display a listing of the user's orders.
     */
    public function index()
    {
        $user = auth('api')->user();

        // Eager load all necessary nested relationships for the order history page.
        $orders = Order::where('user_id', $user->id)
            ->with([
                'menuItems.addons',
                'menuItems.variants',
                'packageItems.menus.addons',
                'packageItems.menus.variants'
            ])
            ->latest() // Show the most recent orders first
            ->get();

        return response()->json($orders);
    }

    /**
     * Display the specified order.
     */
    public function show(Order $order)
    {
        $user = auth('api')->user();

        // Authorization check: ensure the user can only view their own order.
        if ($order->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Load the same relationships for a single order view.
        $order->load([
            'menuItems.addons',
            'menuItems.variants',
            'packageItems.menus.addons',
            'packageItems.menus.variants'
        ]);

        return response()->json($order);
    }
}
