<?php // PHP 脚本开始

namespace App\Http\Controllers; // 定义命名空间，用于组织控制器类

use Illuminate\Http\Request; // 引入 Request 类，用于处理 HTTP 请求
use App\Models\MenuPackage; // 引入 MenuPackage 模型
use App\Models\Menu; // 引入 Menu 模型
use App\Models\Addon; // 引入 Addon 模型
use App\Models\Variant; // 引入 Variant 模型
use App\Models\Cart; // 引入 Cart 模型
use App\Models\CartMenuItem; // 引入 CartMenuItem 模型
use App\Models\CartMenuItemAddon; // 引入 CartMenuItemAddon 模型
use App\Models\CartMenuItemVariant; // 引入 CartMenuItemVariant 模型
use App\Models\CartPackageItem; // 引入 CartPackageItem 模型
use App\Models\CartPackageItemMenu; // 引入 CartPackageItemMenu 模型
use App\Models\CartPackageItemMenuAddon; // 引入 CartPackageItemMenuAddon 模型
use App\Models\CartPackageItemMenuVariant; // 引入 CartPackageItemMenuVariant 模型
use Illuminate\Support\Facades\Auth; // 引入 Auth facade，用于用户认证
use Illuminate\Support\Facades\Validator; // 引入 Validator facade，用于数据验证

class CartController extends Controller // 定义 CartController 类，继承自基础 Controller 类
{
    // 获取或创建购物车
    private function getOrCreateCart() // 定义一个私有方法，用于获取或创建用户的购物车
    {
        return Cart::firstOrCreate([ // 使用 firstOrCreate 方法查找或创建记录
            'user_id' => auth()->id(), // 条件：用户 ID 是当前认证用户的 ID
            'is_checked_out' => false // 条件：购物车未结账
        ]);
    }

    // 添加菜单项到购物车
    public function addMenuItem(Request $request) // 定义一个公共方法，用于将单个菜单项添加到购物车
    {
        $validator = Validator::make($request->all(), [ // 使用 Validator 创建一个验证器实例
            'menu_id' => 'required|integer', // 验证规则：menu_id 必须存在且为整数
            'menu_name' => 'required|string', // 验证规则：menu_name 必须存在且为字符串
            'base_price' => 'required|numeric', // 验证规则：base_price 必须存在且为数字
            'quantity' => 'required|integer|min:1', // 验证规则：quantity 必须存在，为整数且最小为 1
            'addons' => 'array', // 验证规则：addons 必须是数组
            'variants' => 'array', // 验证规则：variants 必须是数组
            'image_url' => 'nullable|string', // 验证规则：image_url 可以为空，如果存在则必须是字符串
            'category_name' => 'nullable|string', // 验证规则：category_name 可以为空，如果存在则必须是字符串
        ]);

        if ($validator->fails()) { // 检查验证是否失败
            return response()->json($validator->errors(), 422); // 如果验证失败，返回 JSON 格式的错误信息和 422 状态码
        }

        $cart = $this->getOrCreateCart(); // 调用 getOrCreateCart 方法获取或创建购物车

        $menuItem = $cart->menuItems()->create([ // 在购物车中创建一个新的菜单项
            'menu_id' => $request->menu_id, // 设置菜单项的 menu_id
            'menu_name' => $request->menu_name, // 设置菜单项的名称
            'menu_description' => $request->menu_description, // 设置菜单项的描述
            'base_price' => $request->base_price, // 设置菜单项的基础价格
            'promotion_price' => $request->promotion_price, // 设置菜单项的促销价格
            'quantity' => $request->quantity, // 设置菜单项的数量
            'image_url' => $request->image_url, // 设置菜单项的图片 URL
            'category_name' => $request->category_name, // 设置菜单项的分类名称
        ]);

        if ($request->has('addons')) { // 检查请求中是否包含 'addons'
            foreach ($request->addons as $addon) { // 遍历请求中的每个附加项
                $menuItem->addons()->create($addon); // 为菜单项创建附加项记录
            }
        }

        if ($request->has('variants')) { // 检查请求中是否包含 'variants'
            foreach ($request->variants as $variant) { // 遍历请求中的每个规格项
                $menuItem->variants()->create($variant); // 为菜单项创建规格项记录
            }
        }

        return response()->json(['message' => 'Menu item added to cart', 'cart' => $cart->load('menuItems.addons', 'menuItems.variants', 'packageItems.menus.addons', 'packageItems.menus.variants')]); // 返回成功的 JSON 响应，包含消息和更新后的购物车数据
    }

    // 添加套餐项到购物车
    public function addPackageItem(Request $request) // 定义一个公共方法，用于将套餐添加到购物车
    {
        // 1. 更新验证规则，只接收必要的信息
        $validator = Validator::make($request->all(), [ // 使用 Validator 创建一个验证器实例
            'menu_package_id' => 'required|exists:menu_packages,id', // 验证规则：menu_package_id 必须存在于 menu_packages 表中
            'quantity'        => 'required|integer|min:1', // 验证规则：quantity 必须存在，为整数且最小为 1
            'options'         => 'present|array', // 验证规则：options 键必须存在，且必须是数组
            'options.menus'   => 'present|array', // 验证规则：options.menus 键必须存在，且必须是数组
            'options.menus.*.menu_id' => 'required|exists:menus,id', // 验证规则：每个菜单的 menu_id 必须存在于 menus 表中
            'options.menus.*.variant_id' => 'nullable|exists:variants,id', // 验证规则：每个菜单的 variant_id 可以为空，如果存在则必须在 variants 表中
            'options.menus.*.addon_ids' => 'present|array', // 验证规则：每个菜单的 addon_ids 必须存在，且必须是数组
            'options.menus.*.addon_ids.*' => 'integer|exists:addons,id', // 验证规则：每个附加项的 id 必须是整数且存在于 addons 表中
        ]);

        if ($validator->fails()) { // 检查验证是否失败
            return response()->json($validator->errors(), 422); // 如果验证失败，返回 JSON 格式的错误信息和 422 状态码
        }

        $cart = $this->getOrCreateCart(); // 调用 getOrCreateCart 方法获取或创建购物车
        $packageId = $request->input('menu_package_id'); // 从请求中获取套餐 ID
        $quantity = $request->input('quantity'); // 从请求中获取数量
        $options = $request->input('options'); // 从请求中获取选项

        // 2. 从数据库获取套餐的权威信息
        $package = MenuPackage::findOrFail($packageId); // 根据 ID 查找套餐，如果找不到则抛出异常

        // 3. 在服务器端重新计算总价，防止篡改
        $unitPrice = ($package->promotion_price > 0) ? $package->promotion_price : $package->base_price; // 计算套餐单价，优先使用促销价

        $optionsPrice = 0; // 初始化选项价格为 0
        foreach ($options['menus'] as $menuOption) { // 遍历套餐中的每个菜单选项
            if (!empty($menuOption['variant_id'])) { // 检查是否存在规格 ID
                $variant = Variant::find($menuOption['variant_id']); // 查找规格
                if ($variant) { // 如果找到规格
                    $optionsPrice += $variant->price_modifier; // 将规格的价格修饰符加到选项价格中
                }
            }
            if (!empty($menuOption['addon_ids'])) { // 检查是否存在附加项 ID
                $optionsPrice += Addon::whereIn('id', $menuOption['addon_ids'])->sum('price'); // 计算所有附加项的总价并加到选项价格中
            }
        }
        $finalUnitPrice = $unitPrice + $optionsPrice; // 计算最终的单价（套餐价 + 选项价）

        // 4. 创建购物车中的套餐主项
        $packageItem = $cart->packageItems()->create([ // 在购物车中创建一个新的套餐项
            'menu_package_id'   => $package->id, // 设置套餐项的 menu_package_id
            'package_name'      => $package->name, // 设置套餐项的名称
            'package_description' => $package->description, // 设置套餐项的描述
            'package_price'     => $finalUnitPrice, // 使用服务器计算的最终价格
            'quantity'          => $quantity, // 设置套餐项的数量
            'package_image'     => $package->image, // 设置套餐项的图片
            'category_name'     => $package->category->name ?? null, // 设置套餐项的分类名称，如果分类不存在则为 null
        ]);

        // 5. 循环创建套餐内的菜单项及其选项
        foreach ($options['menus'] as $menuOption) { // 再次遍历套餐中的每个菜单选项
            $menu = Menu::find($menuOption['menu_id']); // 查找菜单
            if (!$menu) continue; // 如果找不到菜单，则跳过当前循环

            $packageMenu = $packageItem->menus()->create([ // 为套餐项创建一个关联的菜单记录
                'menu_id'         => $menu->id, // 设置菜单 ID
                'menu_name'       => $menu->name, // 设置菜单名称
                'menu_description'=> $menu->description, // 设置菜单描述
                'base_price'      => $menu->base_price, // 设置菜单基础价格
                'quantity'        => 1, // 套餐内子菜单数量总是 1
            ]);

            // 添加 variant
            if (!empty($menuOption['variant_id'])) { // 检查是否存在规格 ID
                $variant = Variant::find($menuOption['variant_id']); // 查找规格
                if ($variant) { // 如果找到规格
                    $packageMenu->variants()->create([ // 为套餐菜单创建规格记录
                        'variant_id' => $variant->id, // 设置规格 ID
                        'variant_name' => $variant->name, // 设置规格名称
                        'variant_price' => $variant->price_modifier, // 设置规格价格
                    ]);
                }
            }

            // 添加 addons
            if (!empty($menuOption['addon_ids'])) { // 检查是否存在附加项 ID
                $addons = Addon::whereIn('id', $menuOption['addon_ids'])->get(); // 获取所有附加项
                foreach ($addons as $addon) { // 遍历每个附加项
                     $packageMenu->addons()->create([ // 为套餐菜单创建附加项记录
                        'addon_id' => $addon->id, // 设置附加项 ID
                        'addon_name' => $addon->name, // 设置附加项名称
                        'addon_price' => $addon->price, // 设置附加项价格
                    ]);
                }
            }
        }

        return response()->json(['message' => 'Package item added to cart successfully!'], 201); // 返回成功的 JSON 响应和 201 状态码
    }

    // 获取当前购物车
    public function getCart() // 定义一个公共方法，用于获取当前用户的购物车内容
    {
        $cart = Cart::with('menuItems.addons', 'menuItems.variants', 'packageItems.menus.addons', 'packageItems.menus.variants') // 预加载关联数据以提高效率
            ->where('user_id', auth()->id()) // 查询条件：当前认证用户的 ID
            ->where('is_checked_out', false) // 查询条件：购物车未结账
            ->first(); // 获取第一个匹配的购物车

        return response()->json(['cart' => $cart]); // 返回包含购物车数据的 JSON 响应
    }

    // 清空购物车
    public function clearCart() // 定义一个公共方法，用于清空购物车
    {
        $cart = Cart::where('user_id', auth()->id())->where('is_checked_out', false)->first(); // 查找当前用户未结账的购物车
        if ($cart) { // 如果找到了购物车
            // Manually delete related items to trigger model events if any. (手动删除关联项以触发任何模型事件)
            $cart->menuItems()->each(function ($item) { // 遍历购物车中的每个菜单项
                $item->addons()->delete(); // 删除菜单项的所有附加项
                $item->variants()->delete(); // 删除菜单项的所有规格项
                $item->delete(); // 删除菜单项本身
            });
            $cart->packageItems()->each(function ($item) { // 遍历购物车中的每个套餐项
                $item->menus()->each(function ($menu) { // 遍历套餐项中的每个菜单
                    $menu->addons()->delete(); // 删除菜单的所有附加项
                    $menu->variants()->delete(); // 删除菜单的所有规格项
                    $menu->delete(); // 删除菜单本身
                });
                $item->delete(); // 删除套餐项本身
            });
            $cart->delete(); // 删除购物车本身
        }
        return response()->json(['message' => 'Cart cleared']); // 返回购物车已清空的消息
    }
}
