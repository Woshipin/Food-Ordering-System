<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Table;

class TableController extends Controller
{
    /**
     * 获取所有可用桌位的列表
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        // 1. 在数据库层面筛选出 is_available 为 true 的所有桌位
        // 这部分逻辑是正确的
        $availableTables = Table::where('is_available', true)->get();

        // 2. 格式化数据以供前端使用
        $formattedTables = $availableTables->map(function (Table $table) {
            return [
                'id' => $table->id,
                'table_code' => $table->table_code, // 修正：将 'name' 改为 'table_code'
                'description' => $table->description,
                'capacity' => $table->capacity,
                'location' => $table->location,
                'status' => 'available', // 优化：因为查询已保证可用，可以直接返回 'available'
            ];
        });

        return response()->json($formattedTables);
    }
}
