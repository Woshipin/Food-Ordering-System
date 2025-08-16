<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Exception;

class HealthCheckController extends Controller
{
    /**
     * @brief  执行健康检查。
     * @details
     *         这个方法会检查应用的核心依赖（如数据库）是否正常。
     *         一个成功的响应表明应用及其服务正在按预期运行。
     * @return \Illuminate\Http\JsonResponse
     */
    public function check(): JsonResponse
    {
        try {
            // 尝试连接数据库并执行一个简单的查询
            DB::connection()->getPdo();

            // 如果数据库连接成功
            return response()->json([
                'status' => 'ok',
                'message' => 'Application and database are healthy.',
                'database_connection' => 'connected',
            ]);

        } catch (Exception $e) {
            // 如果数据库连接失败
            return response()->json([
                'status' => 'error',
                'message' => 'Application is running, but database connection failed.',
                'error' => $e->getMessage(),
            ], 503); // 503 Service Unavailable
        }
    }
}
