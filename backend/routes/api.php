<?php

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
use Illuminate\Support\Facades\Route;

Route::group([
    'middleware' => 'api',
    'prefix'     => 'auth',
], function ($router) {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('refresh', [AuthController::class, 'refresh']);
    Route::get('me', [AuthController::class, 'me']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
});

// CMS Routes
Route::get('/cms/home', [CMSControlled::class, 'homeCms']);
Route::get('/cms/about', [CMSControlled::class, 'aboutUsCms']);
Route::get('/cms/contact', [CMSControlled::class, 'contactCms']);

// Get All Category Data
Route::get('/categories', [CategoryController::class, 'index']);

// Get All Menu Data
Route::get('/menus', [MenuController::class, 'index']);

// Get Menu Data by ID
Route::get('/menus/{menu}', [MenuController::class, 'show']);

// 获取所有套餐列表
Route::get('/menu-packages', [MenuPackageController::class, 'index']);

// 获取单个套餐详情及其包含的菜单（和菜单的附加项/规格）
Route::get('/menu-packages/{menu_package}', [MenuPackageController::class, 'show']);

// Contact Message Routes
Route::post('/contact', [ContactMessageController::class, 'store']);

// Gallery Routes
Route::get('/galleries', [GalleryController::class, 'index']);

// Checkout Option Routes
Route::get('/checkout-options', [CheckoutOptionController::class, 'index'])->name('checkout-options.index');

// Cart Routes (Protected by Auth)
Route::group(['middleware' => 'auth:api'], function () {
    // Add Menu Item to Cart
    Route::post('/cart/menu/add', [CartController::class, 'addMenuItem']);
    // Add Package Item to Cart
    Route::post('/cart/package/add', [CartController::class, 'addPackageItem']);
    // Get Cart
    Route::get('/cart', [CartController::class, 'getCart']);
    // Clear Cart
    Route::delete('/cart', [CartController::class, 'clearCart']);

    // 1. Obtener todas las direcciones del usuario (Index)
    // GET /api/addresses
    Route::get('/address', [AddressController::class, 'index']);

    // 2. Crear una nueva dirección (Store)
    // POST /api/addresses
    Route::post('add/address', [AddressController::class, 'store']);

    // 3. Obtener una dirección específica (Show)
    // GET /api/addresses/{address}
    Route::get('edit/address/{address}', [AddressController::class, 'show']);

    // 4. Actualizar una dirección existente (Update)
    // Usamos PUT o PATCH. PUT reemplaza todo el recurso, PATCH lo actualiza parcialmente.
    // PUT /api/addresses/{address}
    Route::put('update/address/{address}', [AddressController::class, 'update']);

    // 5. Eliminar una dirección (Destroy)
    // DELETE /api/addresses/{address}
    Route::delete('delete/address/{address}', [AddressController::class, 'destroy']);

    // 6. Ruta adicional para marcar una dirección como predeterminada
    // PATCH /api/addresses/{address}/set-default
    Route::patch('/address/{address}/set-default', [AddressController::class, 'setDefault']);
});
