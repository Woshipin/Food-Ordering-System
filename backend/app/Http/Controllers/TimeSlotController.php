<?php
namespace App\Http\Controllers;

use App\Models\TimeSlot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class TimeSlotController extends Controller
{
    /**
     * 获取所有时间段
     */
    public function index(): JsonResponse
    {
        try {
            $timeSlots = TimeSlot::orderBy('start_time', 'asc')->get();

            return response()->json([
                'success' => true,
                'data'    => $timeSlots,
            ]);
        } catch (\Exception $e) {
            // 如果表不存在或其他数据库错误，返回空数组
            return response()->json([
                'success' => true,
                'data'    => [],
                'message' => 'Time slots table not available yet',
            ]);
        }
    }

    /**
     * 获取指定日期的所有时间段（不计算可用性）
     * 用户选择日期后，显示所有时间段供用户选择
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getAvailability(Request $request): JsonResponse
    {
        try {
            // 直接返回所有时间段，不计算可用性
            $timeSlots = TimeSlot::orderBy('start_time', 'asc')->get();

            return response()->json([
                'success' => true,
                'data'    => $timeSlots,
            ]);
        } catch (\Exception $e) {
            // 如果表不存在或其他数据库错误，返回空数组
            return response()->json([
                'success' => true,
                'data'    => [],
                'message' => 'Time slots table not available yet',
            ]);
        }
    }

    /**
     * 检查指定日期的时间段
     * 不做全局可用性检查，因为时间段的可用性应该在桌位级别检查
     * 时间段本身不应该被全局禁用，只有特定桌位在特定时间段才会不可用
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function checkAvailability(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'date' => 'required|date|after_or_equal:today',
            ]);

            $date      = $request->input('date');
            $timeSlots = TimeSlot::orderBy('start_time', 'asc')->get();

            // 返回所有时间段，不做全局可用性检查
            // 可用性检查应该在桌位级别进行，而不是时间段级别
            $timeSlotsWithAvailability = $timeSlots->map(function ($timeSlot) {
                return [
                    'id'           => $timeSlot->id,
                    'start_time'   => $timeSlot->start_time,
                    'end_time'     => $timeSlot->end_time,
                    'is_available' => true, // 时间段本身总是可用的
                ];
            });

            return response()->json([
                'success' => true,
                'date'    => $date,
                'data'    => $timeSlotsWithAvailability,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'error'   => '输入数据有误',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            // 如果表不存在或其他数据库错误，返回空数组但不报错
            return response()->json([
                'success' => true,
                'date'    => $request->input('date'),
                'data'    => [],
                'message' => 'Time slots table not available yet',
            ]);
        }
    }
}
