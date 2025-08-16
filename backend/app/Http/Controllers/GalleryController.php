<?php

namespace App\Http\Controllers;

use App\Models\Gallery;
use Illuminate\Http\Request; // 导入Request类

class GalleryController extends Controller
{
    /**
     * @brief   获取画廊图片列表，支持按分类筛选
     * @details
     *          如果请求中包含 `category_id` 参数，则只返回该分类下的图片。
     *          否则，返回所有状态为启用的图片。
     *          这种后端过滤的方式可以显著减少前端一次性加载的数据量，提升性能。
     *
     * @param   Request $request Laravel的HTTP请求对象
     * @return  \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // 创建一个查询构造器，基础条件是 gallery_status 为 true
        $query = Gallery::where('gallery_status', true);

        // 检查请求中是否存在 'category_id' 参数
        if ($request->has('category_id')) {
            // [关键修复] 将查询字段修正为数据库中的 `category_id` 列
            $query->where('category_id', $request->input('category_id'));
        }

        // 执行查询并获取结果
        $galleries = $query->latest()->get();

        // 返回成功的JSON响应
        return response()->json([
            'message' => 'Gallery data retrieved successfully!',
            'data' => $galleries,
        ], 200);
    }
}
