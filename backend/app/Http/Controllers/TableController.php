<?php
namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Table;
use App\Models\TimeSlot;
use App\Services\TableManagementService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
        try {
            // 暂时简化查询，避免复杂的关联查询可能导致的错误
            $tables = Table::all();

            // 格式化数据，为每个桌位添加基本状态信息
            $formattedTables = $tables->map(function (Table $table) {
                return [
                    'id'                    => $table->id,
                    'table_code'            => $table->table_code,
                    'description'           => $table->description,
                    'capacity'              => $table->capacity,
                    'location'              => $table->location,
                    'is_available'          => $table->is_available,
                    'status'                => $table->is_available ? 'available' : 'maintenance',
                    'status_text'           => $table->is_available ? '可用' : '维护中',
                    'available_for_booking' => $table->is_available,
                ];
            });

            return response()->json($formattedTables);
        } catch (\Exception $e) {
            \Log::error('Error in TableController@index: ' . $e->getMessage());

            // 如果出现错误，返回基本错误信息
            return response()->json([
                'error'   => '无法获取桌位列表',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 决定桌位的当前状态
     * 根据桌位的is_available和当前订单状态来决定显示状态
     * 注意：这里只是显示状态，不影响预订可用性检查（预订可用性由checkTableAvailability方法处理）
     */
    private function determineTableStatus(Table $table, $currentOrder = null): array
    {
        // 如果桌位本身不可用（维护中等）
        if (! $table->is_available) {
            return [
                'status'                => 'maintenance',
                'text'                  => '维护中',
                'available_for_booking' => false,
            ];
        }

        // 如果有活跃订单，显示为正在使用，但仍然允许预订（因为可能是不同时间）
        if ($currentOrder) {
            switch ($currentOrder->table_status) {
                case 'pending':
                    $isOverdue = $currentOrder->isOverdue();
                    return [
                        'status'                => 'pending',
                        'text'                  => $isOverdue ? '用餐中（已超时）' : '用餐中',
                        'available_for_booking' => true, // 改为true，允许预订不同时间段
                    ];
            }
        }

        // 默认可用状态
        return [
            'status'                => 'available',
            'text'                  => '可用',
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
                'id'          => $table->id,
                'table_code'  => $table->table_code,
                'description' => $table->description,
                'capacity'    => $table->capacity,
                'location'    => $table->location,
                'status'      => 'available',
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
                'error'   => '无法获取桌位状态',
                'message' => $e->getMessage(),
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
                'order_id' => 'required|integer|exists:orders,id',
            ]);

            $result = $this->tableManagementService->checkInOrder($request->order_id);

            return response()->json([
                'success' => true,
                'message' => '用户成功入座',
                'data'    => $result,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'error'   => '输入数据有误',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error'   => '入座失败',
                'message' => $e->getMessage(),
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
                'order_id' => 'required|integer|exists:orders,id',
            ]);

            $result = $this->tableManagementService->checkOutOrder($request->order_id);

            return response()->json([
                'success' => true,
                'message' => '用户成功结账',
                'data'    => $result,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'error'   => '输入数据有误',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error'   => '结账失败',
                'message' => $e->getMessage(),
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
                'success'         => true,
                'message'         => '过期订单处理完成',
                'processed_count' => count($results),
                'results'         => $results,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error'   => '处理过期订单失败',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 检查特定日期和时间段的桌位可用性
     * 返回在指定日期和时间段下所有桌位的可用状态
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function checkTableAvailability(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'date'         => 'required|date|after_or_equal:today',
                'time_slot_id' => 'required|integer|exists:time_slots,id',
                'guests_count' => 'integer|min:1|max:20', // 可选参数
            ]);

            $date        = $request->input('date');
            $timeSlotId  = $request->input('time_slot_id');
            $guestsCount = $request->input('guests_count', 1);

            // 获取时间段信息
            $timeSlot = TimeSlot::findOrFail($timeSlotId);

            // 计算完整的checkin和checkout时间
            $checkinTime  = Carbon::parse($date . ' ' . $timeSlot->start_time);
            $checkoutTime = Carbon::parse($date . ' ' . $timeSlot->end_time);

                                                                   // 获取符合客人数量要求的所有桌位（包括暂时不可用的）
                                                                   // 不在这里过滤is_available，而是在后面的逻辑中处理桌位状态
            $tables = Table::where('capacity', '>=', $guestsCount) // 只根据客人数量过滤
                ->get();

            // 为每个桌位检查可用性
            $tablesWithAvailability = $tables->map(function ($table) use ($checkinTime, $checkoutTime, $date) {
                // 检查桌位本身是否可用（非维护中）
                $isTableAvailable = $table->is_available;

                // 将时间转换为标准格式进行比较
                $newCheckinTime  = $checkinTime->format('Y-m-d H:i:s');
                $newCheckoutTime = $checkoutTime->format('Y-m-d H:i:s');

                                                                          // 检查该桌位在指定时间段是否有冲突的订单
                $conflictingOrders = Order::where('table_id', $table->id) // 关键：检查特定桌位
                    ->where('requires_table', true)
                    ->where('table_status', 'pending') // 只检查正在使用的桌位
                    ->where('dining_date', $date)      // 添加日期过滤
                    ->get()                            // 先获取所有订单，然后在PHP中检查时间重叠
                    ->filter(function ($order) use ($newCheckinTime, $newCheckoutTime) {
                        // 将订单时间转换为标准格式
                        $orderCheckin  = Carbon::parse($order->checkin_time)->format('Y-m-d H:i:s');
                        $orderCheckout = Carbon::parse($order->checkout_time)->format('Y-m-d H:i:s');

                        // 时间重叠检测：两个时间段重叠当且仅当
                        // (订单开始时间 < 新时间段结束时间) AND (订单结束时间 > 新时间段开始时间)
                        $overlap = ($orderCheckin < $newCheckoutTime) && ($orderCheckout > $newCheckinTime);

                        return $overlap;
                    });

                $hasTimeConflict = $conflictingOrders->count() > 0;

                // 桌位可用性：桌位本身可用 AND 没有时间冲突
                $isFinallyAvailable = $isTableAvailable && ! $hasTimeConflict;

                // 决定状态显示
                $status     = 'available';
                $statusText = '可用';

                if (! $isTableAvailable) {
                    $status     = 'maintenance';
                    $statusText = '维护中';
                } elseif ($hasTimeConflict) {
                    $status     = 'occupied';
                    $statusText = '该时间段已被预订';
                }

                return [
                    'id'                    => $table->id,
                    'table_code'            => $table->table_code,
                    'description'           => $table->description,
                    'capacity'              => $table->capacity,
                    'location'              => $table->location,
                    'is_available'          => $isFinallyAvailable, // 最终可用性
                    'status'                => $status,
                    'status_text'           => $statusText,
                    'available_for_booking' => $isFinallyAvailable,
                    // 详细调试信息
                    'debug_info'            => [
                        'table_available'          => $isTableAvailable,
                        'has_time_conflict'        => $hasTimeConflict,
                        'final_available'          => $isFinallyAvailable,
                        'conflicting_orders_count' => $conflictingOrders->count(),
                        'check_time_range'         => [
                            'new_checkin'  => $newCheckinTime,
                            'new_checkout' => $newCheckoutTime,
                        ],
                        'conflicting_orders'       => $conflictingOrders->map(function ($order) use ($newCheckinTime, $newCheckoutTime) {
                            $orderCheckin  = Carbon::parse($order->checkin_time)->format('Y-m-d H:i:s');
                            $orderCheckout = Carbon::parse($order->checkout_time)->format('Y-m-d H:i:s');
                            $overlap       = ($orderCheckin < $newCheckoutTime) && ($orderCheckout > $newCheckinTime);

                            return [
                                'order_id'       => $order->id,
                                'order_number'   => $order->order_number,
                                'order_checkin'  => $orderCheckin,
                                'order_checkout' => $orderCheckout,
                                'dining_date'    => $order->dining_date,
                                'overlap_check'  => [
                                    'condition1'    => $orderCheckin . ' < ' . $newCheckoutTime . ' = ' . ($orderCheckin < $newCheckoutTime ? 'true' : 'false'),
                                    'condition2'    => $orderCheckout . ' > ' . $newCheckinTime . ' = ' . ($orderCheckout > $newCheckinTime ? 'true' : 'false'),
                                    'final_overlap' => $overlap ? 'true' : 'false',
                                ],
                            ];
                        })->toArray(),
                    ],
                ];
            });

            return response()->json([
                'success'          => true,
                'date'             => $date,
                'time_slot'        => [
                    'id'         => $timeSlot->id,
                    'start_time' => $timeSlot->start_time,
                    'end_time'   => $timeSlot->end_time,
                ],
                'checkin_time'     => $checkinTime->format('Y-m-d H:i:s'),
                'checkout_time'    => $checkoutTime->format('Y-m-d H:i:s'),
                'guests_count'     => $guestsCount,
                'total_tables'     => $tablesWithAvailability->count(),
                'available_tables' => $tablesWithAvailability->where('is_available', true)->count(),
                'data'             => $tablesWithAvailability->values(),
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'error'   => '输入数据有误',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
                                                                                                         // 如果时间段表不存在或其他数据库错误，返回基本桌位信息
            $tablesWithAvailability = Table::where('capacity', '>=', $request->input('guests_count', 1)) // 只根据客人数过滤
                ->get()
                ->map(function ($table) {
                    return [
                        'id'                    => $table->id,
                        'table_code'            => $table->table_code,
                        'description'           => $table->description,
                        'capacity'              => $table->capacity,
                        'location'              => $table->location,
                        'is_available'          => $table->is_available, // 使用桌位本身的可用性
                        'status'                => $table->is_available ? 'available' : 'maintenance',
                        'status_text'           => $table->is_available ? '可用' : '维护中',
                        'available_for_booking' => $table->is_available,
                    ];
                });

            return response()->json([
                'success'          => true,
                'date'             => $request->input('date'),
                'time_slot'        => [
                    'id'         => $request->input('time_slot_id'),
                    'start_time' => null,
                    'end_time'   => null,
                ],
                'checkin_time'     => null,
                'checkout_time'    => null,
                'guests_count'     => $request->input('guests_count', 1),
                'total_tables'     => $tablesWithAvailability->count(),
                'available_tables' => $tablesWithAvailability->count(),
                'data'             => $tablesWithAvailability->values(),
                'message'          => 'Time slots feature not available yet, showing basic table info',
            ]);
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
                'available'    => 0,
                'pending'      => 0,
                'seated'       => 0,
                'maintenance'  => 0,
                'tables'       => [],
            ];

            foreach ($tables as $table) {
                $currentOrder = $table->orders->first();
                $status       = $this->determineTableStatus($table, $currentOrder);

                $overview[$status['status']]++;

                $tableInfo = [
                    'id'          => $table->id,
                    'table_code'  => $table->table_code,
                    'capacity'    => $table->capacity,
                    'location'    => $table->location,
                    'status'      => $status['status'],
                    'status_text' => $status['text'],
                ];

                if ($currentOrder) {
                    $tableInfo['current_order'] = [
                        'order_number'      => $currentOrder->order_number,
                        'guests_count'      => $currentOrder->guests_count,
                        'checkin_time'      => $currentOrder->checkin_time?->format('H:i'),
                        'checkout_time'     => $currentOrder->checkout_time?->format('H:i'),
                        'auto_extend_count' => $currentOrder->auto_extend_count,
                        'is_overdue'        => $currentOrder->isOverdue(),
                    ];
                }

                $overview['tables'][] = $tableInfo;
            }

            return response()->json($overview);
        } catch (\Exception $e) {
            return response()->json([
                'error'   => '无法获取桌位概述',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
