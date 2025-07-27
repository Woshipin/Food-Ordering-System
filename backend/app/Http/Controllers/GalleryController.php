<?php

namespace App\Http\Controllers;

use App\Models\Gallery;

class GalleryController extends Controller
{
    public function index()
    {
        // 只获取 gallery_status 为 true 的记录
        $galleries = Gallery::where('gallery_status', true)->get();

        return response()->json([
            'message' => 'Gallery data retrieved successfully!',
            'data' => $galleries,
        ], 200);
    }
}
