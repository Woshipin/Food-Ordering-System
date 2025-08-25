<?php
namespace App\Http\Controllers;

use App\Models\TimeSlot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TimeSlotController extends Controller
{
    /**
     * 获取所有时间段
     */
    public function index(): JsonResponse
    {
        $timeSlots = TimeSlot::orderBy('start_time', 'asc')->get();

        return response()->json([
            'success' => true,
            'data'    => $timeSlots,
        ]);
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
        // 直接返回所有时间段，不计算可用性
        $timeSlots = TimeSlot::orderBy('start_time', 'asc')->get();

        return response()->json([
            'success' => true,
            'data'    => $timeSlots,
        ]);
    }
}
