<?php
/**
 * =====================================================================================
 * @file        api.php
 * @brief       应用的所有API路由定义文件。
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

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ContactMessageController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\MenuPackageController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutOptionController;
use App\Http\Controllers\CMSControlled;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\OrderController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| 这里是您可以为您的应用程序注册API路由的地方。这些路由由
| RouteServiceProvider 加载，并且它们都被分配到了 "api" 中间件组。
| 尽情享受构建您的API吧！
|
*/

// 应用Laravel默认的API中间件栈（如节流等）
Route::middleware('api')->group(function () {

    // --- 认证路由组 (Authentication Routes) ---
    // 这个组内的所有路由都会自动添加 `/auth` 前缀
    Route::controller(AuthController::class)->prefix('auth')->group(function () {
        Route::post('login', 'login');
        Route::post('register', 'register');
        Route::post('logout', 'logout');
        Route::post('refresh', 'refresh');
        Route::get('me', 'me');
        Route::put('user/profile', 'updateProfile');
    });

    // --- 公开路由组 (Public Routes) ---
    // 无需认证即可访问的路由
    Route::group([], function() {
        // 内容管理系统 (CMS)
        Route::controller(CMSControlled::class)->prefix('cms')->group(function () {
            Route::get('/home', 'homeCms');
            Route::get('/about', 'aboutUsCms');
            Route::get('/contact', 'contactCms');
        });

        // 分类
        Route::get('/categories', [CategoryController::class, 'index']);

        // 菜单
        Route::controller(MenuController::class)->prefix('menus')->group(function () {
            Route::get('/', 'index');
            Route::get('/{menu}', 'show');
        });

        // 套餐
        Route::controller(MenuPackageController::class)->prefix('menu-packages')->group(function () {
            Route::get('/', 'index');
            Route::get('/{menu_package}', 'show');
        });

        // 联系表单
        Route::post('/contact', [ContactMessageController::class, 'store']);

        // 画廊
        Route::get('/galleries', [GalleryController::class, 'index']);

        // 结账选项
        Route::get('/checkout-options', [CheckoutOptionController::class, 'index'])->name('checkout-options.index');
    });


    // --- 受保护的路由组 (需要用户认证) ---
    // 必须在请求头中提供有效的JWT令牌才能访问
    Route::middleware('auth:api')->group(function () {
        // 购物车
        Route::controller(CartController::class)->prefix('cart')->group(function () {
            Route::post('/menu/add', 'addMenuItem');
            Route::post('/package/add', 'addPackageItem');
            Route::get('/', 'getCart');
            Route::delete('/', 'clearCart');
        });

        // 用户地址
        Route::controller(AddressController::class)->prefix('address')->group(function () {
            Route::get('/', 'index');
            Route::post('/add', 'store');
            Route::get('/edit/{address}', 'show');
            Route::put('/update/{address}', 'update');
            Route::delete('/delete/{address}', 'destroy');
            Route::patch('/{address}/set-default', 'setDefault');
        });

        // 订单
        Route::controller(OrderController::class)->prefix('orders')->group(function () {
            Route::post('/add', 'store');
            Route::get('/', 'index');
            Route::get('/{order}', 'show');
        });
    });
});
