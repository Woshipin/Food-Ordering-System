<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\MenuPackageController;

Route::group([
    'middleware' => 'api',
    'prefix'     => 'auth',
], function ($router) {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('refresh', [AuthController::class, 'refresh']);
    Route::get('me', [AuthController::class, 'me']);
});

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
