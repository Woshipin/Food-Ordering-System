<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Table;
use App\Models\Order;
use App\Services\TableManagementService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class TableController extends Controller
{
    /**
     * 桌位管理服务实例
     */
    private TableManagementService $tableManagementService;

    /**
     * 创建控制器实例
     */
    public function __construct(TableManagementService $tableManagementService)
    {
        $this->tableManagementService = $tableManagementService;
    }
    /**
     * 获取所有桌位的列表（包括状态信息）
     * 为前端提供详细的桌位状态信息，包括pending状态
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        // 获取所有桌位及其当前状态
        $tables = Table::with(['orders' => function ($query) {
            // 只获取当前活跃的dine-in订单（pending或seated状态）
            $query->where('requires_table', true)
                  ->whereIn('table_status', ['pending'])
                  ->latest();
        }])->get();

        // 格式化数据，为每个桌位添加详细状态信息
        $formattedTables = $tables->map(function (Table $table) {
            $currentOrder = $table->orders->first(); // 获取最新的活跃订单

            // 决定桌位的当前状态
            $status = $this->determineTableStatus($table, $currentOrder);

            $tableData = [
                'id' => $table->id,
                'table_code' => $table->table_code,
                'description' => $table->description,
                'capacity' => $table->capacity,
                'location' => $table->location,
                'is_available' => $table->is_available,
                'status' => $status['status'], // available, pending, seated, maintenance
                'status_text' => $status['text'], // 中文状态描述
                'available_for_booking' => $status['available_for_booking'], // 是否可以预订
            ];

            // 如果有活跃订单，添加订单信息
            if ($currentOrder) {
                $tableData['current_order'] = [
                    'order_id' => $currentOrder->id,
                    'order_number' => $currentOrder->order_number,
                    'table_status' => $currentOrder->table_status,
                    'guests_count' => $currentOrder->guests_count,
                    'checkin_time' => $currentOrder->checkin_time?->format('Y-m-d H:i:s'),
                    'checkout_time' => $currentOrder->checkout_time?->format('Y-m-d H:i:s'),
                    'dining_date' => $currentOrder->dining_date?->format('Y-m-d'),
                    'auto_extend_count' => $currentOrder->auto_extend_count,
                    'total_extended_minutes' => $currentOrder->total_extended_minutes,
                ];

                // 如果是pending状态，添加倒计时信息
                if ($currentOrder->table_status === 'pending' && $currentOrder->checkin_time) {
                    $now = Carbon::now();
                    $checkinTime = Carbon::parse($currentOrder->checkin_time);

                    if ($checkinTime->isFuture()) {
                        $tableData['countdown'] = [
                            'minutes_until_checkin' => $now->diffInMinutes($checkinTime),
                            'checkin_time_formatted' => $checkinTime->format('H:i'),
                        ];
                    }
                }
            }

            return $tableData;
        });

        return response()->json($formattedTables);
    }

    /**
     * 决定桌位的当前状态
     * 根据桌位的is_available和当前订单状态来决定显示状态
     */
    private function determineTableStatus(Table $table, $currentOrder = null): array
    {
        // 如果桌位本身不可用（维护中等）
        if (!$table->is_available && !$currentOrder) {
            return [
                'status' => 'maintenance',
                'text' => '维护中',
                'available_for_booking' => false,
            ];
        }

        // 如果有活跃订单
        if ($currentOrder) {
            switch ($currentOrder->table_status) {
                case 'pending':
                    $isOverdue = $currentOrder->isOverdue();
                    return [
                        'status' => 'pending',
                        'text' => $isOverdue ? '用餐中（已超时）' : '用餐中',
                        'available_for_booking' => false,
                    ];
            }
        }

        // 默认可用状态
        return [
            'status' => 'available',
            'text' => '可用',
            'available_for_booking' => true,
        ];
    }

    /**
     * 获取可用于预订的桌位列表
     * 只返回可以被预订的桌位
     */
    public function available()
    {
        $availableTables = Table::where('is_available', true)
            ->whereDoesntHave('orders', function ($query) {
                $query->where('requires_table', true)
                      ->where('table_status', 'pending'); // 只检查pending状态（正在使用）
            })
            ->get();

        $formattedTables = $availableTables->map(function (Table $table) {
            return [
                'id' => $table->id,
                'table_code' => $table->table_code,
                'description' => $table->description,
                'capacity' => $table->capacity,
                'location' => $table->location,
                'status' => 'available',
                'status_text' => '可用',
            ];
        });

        return response()->json($formattedTables);
    }

    /**
     * 获取单个桌位的详细状态信息
     * GET /api/tables/{id}/status
     */
    public function getTableStatus(int $id): JsonResponse
    {
        try {
            $status = $this->tableManagementService->getTableStatus($id);
            return response()->json($status);
        } catch (\Exception $e) {
            return response()->json([
                'error' => '无法获取桌位状态',
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * 手动入座操作
     * POST /api/tables/checkin
     */
    public function checkIn(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'order_id' => 'required|integer|exists:orders,id'
            ]);

            $result = $this->tableManagementService->checkInOrder($request->order_id);

            return response()->json([
                'success' => true,
                'message' => '用户成功入座',
                'data' => $result
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'error' => '输入数据有误',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => '入座失败',
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * 手动结账操作
     * POST /api/tables/checkout
     */
    public function checkOut(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'order_id' => 'required|integer|exists:orders,id'
            ]);

            $result = $this->tableManagementService->checkOutOrder($request->order_id);

            return response()->json([
                'success' => true,
                'message' => '用户成功结账',
                'data' => $result
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'error' => '输入数据有误',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => '结账失败',
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * 手动触发过期订单检查（管理员功能）
     * POST /api/tables/process-expired
     */
    public function processExpiredOrders(): JsonResponse
    {
        try {
            $results = $this->tableManagementService->processExpiredOrders();

            return response()->json([
                'success' => true,
                'message' => '过期订单处理完成',
                'processed_count' => count($results),
                'results' => $results
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => '处理过期订单失败',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 获取所有桌位的实时状态概述（管理员功能）
     * GET /api/tables/overview
     */
    public function getTablesOverview(): JsonResponse
    {
        try {
            $tables = Table::with(['orders' => function ($query) {
                $query->where('requires_table', true)
                      ->whereIn('table_status', ['pending', 'seated'])
                      ->latest();
            }])->get();

            $overview = [
                'total_tables' => $tables->count(),
                'available' => 0,
                'pending' => 0,
                'seated' => 0,
                'maintenance' => 0,
                'tables' => []
            ];

            foreach ($tables as $table) {
                $currentOrder = $table->orders->first();
                $status = $this->determineTableStatus($table, $currentOrder);

                $overview[$status['status']]++;

                $tableInfo = [
                    'id' => $table->id,
                    'table_code' => $table->table_code,
                    'capacity' => $table->capacity,
                    'location' => $table->location,
                    'status' => $status['status'],
                    'status_text' => $status['text']
                ];

                if ($currentOrder) {
                    $tableInfo['current_order'] = [
                        'order_number' => $currentOrder->order_number,
                        'guests_count' => $currentOrder->guests_count,
                        'checkin_time' => $currentOrder->checkin_time?->format('H:i'),
                        'checkout_time' => $currentOrder->checkout_time?->format('H:i'),
                        'auto_extend_count' => $currentOrder->auto_extend_count,
                        'is_overdue' => $currentOrder->isOverdue()
                    ];
                }

                $overview['tables'][] = $tableInfo;
            }

            return response()->json($overview);
        } catch (\Exception $e) {
            return response()->json([
                'error' => '无法获取桌位概述',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
