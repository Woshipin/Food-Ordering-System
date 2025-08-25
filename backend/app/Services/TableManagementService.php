<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Table;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * 桌位管理服务类
 * 基于orders表实现桌位自动化管理，包括状态检查、自动延长和强制结束等功能
 */
class TableManagementService
{
    /**
     * 处理过期的dine-in订单
     * 这是核心的自动化方法，定期被调用来检查和处理超时的桌位订单
     */
    public function processExpiredOrders(): array
    {
        Log::info('开始处理过期的桌位订单');
        
        $processedOrders = [];
        
        // 获取所有已入座但超过预计离座时间的dine-in订单
        $expiredOrders = Order::where('requires_table', true)
            ->where('table_status', 'pending') // pending状态代表正在使用桌位
            ->where('checkout_time', '<', now())
            ->with(['table', 'user'])
            ->get();

        Log::info("找到 {$expiredOrders->count()} 个过期的桌位订单");

        foreach ($expiredOrders as $order) {
            try {
                $result = $this->handleExpiredOrder($order);
                $processedOrders[] = $result;
                
                Log::info("处理订单 {$order->order_number}: {$result['action']}");
                
            } catch (\Exception $e) {
                Log::error("处理订单 {$order->order_number} 失败: " . $e->getMessage());
                $processedOrders[] = [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'action' => 'error',
                    'message' => $e->getMessage()
                ];
            }
        }

        Log::info("桌位订单处理完成，总共处理 " . count($processedOrders) . " 个订单");
        
        return $processedOrders;
    }

    /**
     * 处理单个过期订单
     * 根据业务规则决定是自动延长还是强制结束
     */
    private function handleExpiredOrder(Order $order): array
    {
        // 检查是否有下一个预订冲突
        $hasConflictingReservation = $this->hasConflictingReservation($order);
        
        if ($hasConflictingReservation) {
            // 有下一个预订，强制结束当前用餐
            return $this->forceEndOrder($order, 'next_booking');
        }
        
        // 检查是否可以自动延长
        if ($this->canAutoExtend($order)) {
            // 可以自动延长，延长30分钟
            return $this->autoExtendOrder($order, 30);
        }
        
        // 已达到最大延长次数，强制结束
        return $this->forceEndOrder($order, 'time_exceeded');
    }

    /**
     * 检查是否有冲突的下一个预订
     * 查看接下来30分钟内是否有其他pending状态的预订
     */
    private function hasConflictingReservation(Order $currentOrder): bool
    {
        $checkTime = now()->addMinutes(30);
        
        $conflictingOrder = Order::where('table_id', $currentOrder->table_id)
            ->where('id', '!=', $currentOrder->id)
            ->where('requires_table', true)
            ->where('table_status', 'pending') // pending状态代表正在使用
            ->where('checkin_time', '<=', $checkTime)
            ->first();
            
        return $conflictingOrder !== null;
    }

    /**
     * 检查订单是否可以自动延长
     * 最多允许2次自动延长，每次30分钟，总共最多1小时
     */
    private function canAutoExtend(Order $order): bool
    {
        return $order->auto_extend_count < 2;
    }

    /**
     * 自动延长订单时间
     */
    private function autoExtendOrder(Order $order, int $minutes = 30): array
    {
        DB::transaction(function () use ($order, $minutes) {
            // 更新订单的延长信息
            $order->update([
                'checkout_time' => $order->checkout_time->addMinutes($minutes),
                'auto_extend_count' => $order->auto_extend_count + 1,
                'total_extended_minutes' => $order->total_extended_minutes + $minutes,
            ]);
        });

        // 发送自动延长通知（这里可以集成通知系统）
        $this->sendAutoExtensionNotification($order, $minutes);

        return [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'table_code' => $order->table->table_code ?? 'Unknown',
            'action' => 'auto_extended',
            'message' => "自动延长 {$minutes} 分钟",
            'extend_count' => $order->auto_extend_count,
            'new_checkout_time' => $order->checkout_time->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * 强制结束订单
     */
    private function forceEndOrder(Order $order, string $reason): array
    {
        DB::transaction(function () use ($order) {
            // 更新订单状态为已完成
            $order->update([
                'table_status' => 'completed',
            ]);

            // 释放桌位
            if ($order->table) {
                $order->table->update(['is_available' => true]);
            }
        });

        // 发送强制结束通知
        $this->sendForceEndNotification($order, $reason);

        $reasonText = $reason === 'next_booking' ? '有下一个预订' : '超过最大延长时间';

        return [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'table_code' => $order->table->table_code ?? 'Unknown',
            'action' => 'force_ended',
            'message' => "强制结束用餐 - {$reasonText}",
            'reason' => $reason,
            'end_time' => now()->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * 手动用户入座
     * 由于pending状态已经代表正在使用，这个方法主要用于记录实际入座时间
     */
    public function checkInOrder(int $orderId): array
    {
        $order = Order::with('table')->findOrFail($orderId);

        if ($order->table_status !== 'pending') {
            throw new \Exception('订单状态不正确，无法入座');
        }

        DB::transaction(function () use ($order) {
            // 由于pending状态已经代表正在使用，这里只需记录时间日志
            // 不需要更新数据库字段
        });

        Log::info("订单 {$order->order_number} 已记录实际入座时间");

        return [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'table_code' => $order->table->table_code ?? 'Unknown',
            'action' => 'checked_in',
            'message' => '用户已记录实际入座时间',
            'checkin_time' => now()->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * 手动用户结账
     * 当用户主动结账离开时调用
     */
    public function checkOutOrder(int $orderId): array
    {
        $order = Order::with('table')->findOrFail($orderId);

        if ($order->table_status !== 'pending') {
            throw new \Exception('订单状态不正确，无法结账');
        }

        DB::transaction(function () use ($order) {
            $order->update([
                'table_status' => 'completed',
                'actual_checkout_time' => now(),
            ]);

            // 释放桌位
            if ($order->table) {
                $order->table->update(['is_available' => true]);
            }
        });

        Log::info("订单 {$order->order_number} 已结账");

        return [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'table_code' => $order->table->table_code ?? 'Unknown',
            'action' => 'checked_out',
            'message' => '用户已结账离开',
            'checkout_time' => now()->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * 获取桌位当前状态
     * 根据orders表中的数据确定桌位的实时状态
     */
    public function getTableStatus(int $tableId): array
    {
        $table = Table::findOrFail($tableId);
        
        // 查找当前活跃的订单
        $activeOrder = Order::where('table_id', $tableId)
            ->where('requires_table', true)
            ->where('table_status', 'pending') // pending状态代表正在使用
            ->with('user')
            ->latest()
            ->first();

        if (!$activeOrder) {
            return [
                'table_id' => $tableId,
                'table_code' => $table->table_code,
                'status' => 'available',
                'status_text' => '可用',
                'is_available' => true,
            ];
        }

        $statusInfo = [
            'table_id' => $tableId,
            'table_code' => $table->table_code,
            'order_id' => $activeOrder->id,
            'order_number' => $activeOrder->order_number,
            'guests_count' => $activeOrder->guests_count,
            'checkin_time' => $activeOrder->checkin_time?->format('Y-m-d H:i:s'),
            'checkout_time' => $activeOrder->checkout_time?->format('Y-m-d H:i:s'),
            'auto_extend_count' => $activeOrder->auto_extend_count,
            'total_extended_minutes' => $activeOrder->total_extended_minutes,
        ];

        switch ($activeOrder->table_status) {
            case 'pending':
                $isOverdue = $activeOrder->isOverdue();
                $statusInfo['status'] = 'pending';
                $statusInfo['status_text'] = $isOverdue ? '用餐中（已超时）' : '用餐中';
                $statusInfo['is_available'] = false;
                $statusInfo['is_overdue'] = $isOverdue;
                break;
        }

        return $statusInfo;
    }

    /**
     * 发送自动延长通知
     */
    private function sendAutoExtensionNotification(Order $order, int $minutes): void
    {
        // 这里可以集成邮件、短信或其他通知系统
        Log::info("发送自动延长通知: 订单 {$order->order_number} 已自动延长 {$minutes} 分钟");
        
        // 示例：可以在这里调用通知服务
        // NotificationService::send($order->user, 'auto_extension', [
        //     'table_code' => $order->table->table_code,
        //     'extended_minutes' => $minutes,
        //     'new_checkout_time' => $order->checkout_time
        // ]);
    }

    /**
     * 发送强制结束通知
     */
    private function sendForceEndNotification(Order $order, string $reason): void
    {
        $reasonText = $reason === 'next_booking' ? '有下一个预订' : '超过最大延长时间';
        
        Log::info("发送强制结束通知: 订单 {$order->order_number} - {$reasonText}");
        
        // 示例：可以在这里调用通知服务
        // NotificationService::send($order->user, 'force_end', [
        //     'table_code' => $order->table->table_code,
        //     'reason' => $reasonText
        // ]);
    }
}