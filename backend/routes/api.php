<?php
/**
 * =====================================================================================
 * @file        api.php
 * @brief       应用的所有API路由定义文件
 * @details
 *              这个文件是后端所有API请求的入口点。它将特定的URL（端点）映射到
 *              对应的控制器(Controller)方法上。Laravel会根据这个文件来决定如何处理
 *              每一个传入的API请求。
 *
 * @purpose     1.  **定义API端点**: 明确声明应用提供了哪些API接口。
 *              2.  **请求分发**: 将不同的API请求分发给相应的控制器逻辑进行处理。
 *              3.  **中间件保护**: 为路由或路由组应用中间件（Middleware），例如，
 *                  使用 `auth:api` 来保护需要用户认证才能访问的接口。
 *
 * @usage       当前端应用（如Next.js）向 `/api/...` 发送请求时，Laravel会查找
 *              此文件来匹配对应的路由规则并执行相应的操作。例如，前端请求
 *              `POST /api/auth/login` 会被此文件捕获，并交由 `AuthController`
 *              的 `login` 方法处理。
 * =====================================================================================
 */

// --- 命名空间导入 (Namespace Imports) ---
// 导入所有需要用到的控制器类和Laravel的路由门面
use App\Http\Controllers\AddressController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CheckoutOptionController;
use App\Http\Controllers\CMSControlled;
use App\Http\Controllers\ContactMessageController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\HealthCheckController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\MenuPackageController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\TableController;
use App\Http\Controllers\TimeSlotController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API 路由 (API Routes)
|--------------------------------------------------------------------------
|
| 这里是为应用程序注册API路由的地方。所有这些路由都由
| RouteServiceProvider 加载，并自动应用 "api" 中间件组。
| 这个中间件组提供了一些通用功能，如节流（throttling）等。
|
*/

/**
 * @brief 主路由组
 * @details
 *   所有的API路由都被包裹在这个 `middleware('api')` 组内。
 *   这确保了所有接口都应用了Laravel默认的API中间件栈，
 *   提供了如请求节流（防止暴力破解）等基础安全功能。
 */
Route::middleware('api')->group(function () {

    // =================================================================================
    // --- 认证路由组 (Authentication Routes) ---
    //   - URL前缀: /api/auth
    //   - 控制器: AuthController
    //   - 描述: 处理用户登录、注册、登出、刷新令牌和获取用户信息等所有与身份认证相关的操作。
    // =================================================================================
    Route::controller(AuthController::class)->prefix('auth')->group(function () {
        // --- 登录和注册 ---
        // 为防止暴力破解攻击，对这两个接口应用了更严格的限流：每分钟最多5次请求。
        Route::post('login', 'login')->middleware('throttle:5,1');
        Route::post('register', 'register')->middleware('throttle:5,1');

                                                     // --- 其他认证接口 ---
                                                     // 这些接口使用默认的API限流设置（通常是每分钟60次）。
        Route::post('logout', 'logout');             // 用户登出
        Route::post('refresh', 'refresh');           // 刷新JWT令牌
        Route::get('me', 'me');                      // 获取当前登录用户信息
        Route::put('user/profile', 'updateProfile'); // 更新用户信息
    });

    // =================================================================================
    // --- 公开路由组 (Public Routes) ---
    //   - 描述: 这些路由是公开的，任何用户（无论是否登录）都可以访问。
    //           主要用于获取公开信息，如菜单、分类、CMS内容等。
    // =================================================================================
    Route::group([], function () {
        // --- 健康检查 ---
        // 一个简单的端点，用于检查API服务是否正在运行。
        Route::get('/health', [HealthCheckController::class, 'check']);

        // --- 内容管理系统 (CMS) ---
        // URL前缀: /api/cms
        // 控制器: CMSControlled
        Route::controller(CMSControlled::class)->prefix('cms')->group(function () {
            Route::get('/home', 'homeCms');       // 获取首页内容
            Route::get('/about', 'aboutUsCms');   // 获取“关于我们”页面内容
            Route::get('/contact', 'contactCms'); // 获取“联系我们”页面内容
        });

                                                                         // --- 分类 (Categories) ---
        Route::get('/categories', [CategoryController::class, 'index']); // 获取所有菜品分类

        // --- 时间段 (Time Slots) ---
        Route::get('/timeslots', [TimeSlotController::class, 'index']);
        Route::get('/timeslots/availability', [TimeSlotController::class, 'getAvailability']); // 获取指定日期的时间段可用性

        Route::get('/tables', [TableController::class, 'index']);                      // 获取所有餐桌信息（包含状态）
        Route::get('/tables/available', [TableController::class, 'available']);        // 获取可用于预订的餐桌
        Route::get('/tables/overview', [TableController::class, 'getTablesOverview']); // 获取桌位概述（管理员）
        Route::get('/tables/{id}/status', [TableController::class, 'getTableStatus']); // 获取单个桌位状态

        // --- 菜单 (Menus) ---
        // URL前缀: /api/menus
        // 控制器: MenuController
        Route::controller(MenuController::class)->prefix('menus')->group(function () {
            Route::get('/', 'index');      // 获取所有菜单项列表
            Route::get('/{menu}', 'show'); // 获取单个菜单项的详细信息
        });

        // --- 套餐 (Menu Packages) ---
        // URL前缀: /api/menu-packages
        // 控制器: MenuPackageController
        Route::controller(MenuPackageController::class)->prefix('menu-packages')->group(function () {
            Route::get('/', 'index');              // 获取所有套餐列表
            Route::get('/{menu_package}', 'show'); // 获取单个套餐的详细信息
        });

        // --- 联系表单 (Contact Form) ---
        // 接收来自“联系我们”页面的用户留言。
        Route::post('/contact', [ContactMessageController::class, 'store']);

                                                                       // --- 画廊 (Gallery) ---
        Route::get('/galleries', [GalleryController::class, 'index']); // 获取画廊图片

        // --- 结账选项 (Checkout Options) ---
        // 获取可用的支付方式和服务方式（如外卖、自取）。
        Route::get('/checkout-options', [CheckoutOptionController::class, 'index'])->name('checkout-options.index');
    });

    // =================================================================================
    // --- 受保护的路由组 (Protected Routes) ---
    //   - 中间件: auth:api
    //   - 描述: 这里的路由都需要用户进行身份认证。请求时必须在HTTP头中提供
    //           一个有效的JWT Bearer Token，否则将返回401 Unauthorized错误。
    // =================================================================================
    Route::middleware('auth:api')->group(function () {
        // --- 购物车 (Cart) ---
        // URL前缀: /api/cart
        // 控制器: CartController
        Route::controller(CartController::class)->prefix('cart')->group(function () {
            Route::post('/menu/add', 'addMenuItem');       // 添加单个菜单到购物车
            Route::post('/package/add', 'addPackageItem'); // 添加套餐到购物车
            Route::get('/', 'getCart');                    // 获取购物车内容
            Route::delete('/', 'clearCart');               // 清空购物车
        });

        // --- 用户地址 (User Addresses) ---
        // URL前缀: /api/address
        // 控制器: AddressController
        Route::controller(AddressController::class)->prefix('address')->group(function () {
            Route::get('/', 'index');                             // 获取用户所有地址
            Route::post('/add', 'store');                         // 新增地址
            Route::get('/edit/{address}', 'show');                // 获取单个地址信息（用于编辑）
            Route::put('/update/{address}', 'update');            // 更新地址
            Route::delete('/delete/{address}', 'destroy');        // 删除地址
            Route::patch('/{address}/set-default', 'setDefault'); // 设置为默认地址
        });

        // --- 订单 (Orders) ---
        // URL前缀: /api/orders
        // 控制器: OrderController
        Route::controller(OrderController::class)->prefix('orders')->group(function () {
            Route::post('/add', 'store');   // 创建新订单
            Route::get('/', 'index');       // 获取用户历史订单列表
            Route::get('/{order}', 'show'); // 获取单个订单的详细信息
        });
    });
});
