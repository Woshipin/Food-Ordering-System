<?php

namespace App\Console\Commands;

use App\Services\TableManagementService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

/**
 * 桌位预订检查命令
 * 定期执行的命令，用于检查过期的桌位订单并执行自动化处理
 */
class CheckTableReservations extends Command
{
    /**
     * 命令名称和签名
     * 可以通过 php artisan tables:check-reservations 来手动执行
     *
     * @var string
     */
    protected $signature = 'tables:check-reservations 
                           {--dry-run : 只显示会执行的操作，不实际执行}
                           {--detailed : 显示详细输出}';

    /**
     * 命令描述
     *
     * @var string
     */
    protected $description = '检查过期的桌位预订，执行自动延长或强制结束操作';

    /**
     * 桌位管理服务实例
     *
     * @var TableManagementService
     */
    private TableManagementService $tableManagementService;

    /**
     * 创建命令实例
     */
    public function __construct(TableManagementService $tableManagementService)
    {
        parent::__construct();
        $this->tableManagementService = $tableManagementService;
    }

    /**
     * 执行命令
     * 这是命令的主要执行逻辑
     */
    public function handle(): int
    {
        $isDryRun = $this->option('dry-run');
        $isDetailed = $this->option('detailed');

        // 显示命令开始信息
        $this->info('🍽️  开始检查桌位预订状态...');

        if ($isDryRun) {
            $this->warn('⚠️  这是干运行模式，不会实际执行任何操作');
        }

        $startTime = microtime(true);

        try {
            if ($isDryRun) {
                // 干运行模式 - 只显示会执行的操作
                $results = $this->performDryRun();
            } else {
                // 实际执行处理逻辑
                $results = $this->tableManagementService->processExpiredOrders();
            }

            // 显示处理结果
            $this->displayResults($results, $isDetailed);

            $endTime = microtime(true);
            $executionTime = round(($endTime - $startTime) * 1000, 2);

            $this->info("✅ 桌位检查完成！耗时: {$executionTime}ms");

            // 记录到日志
            Log::info('桌位预订检查命令执行完成', [
                'processed_orders' => count($results),
                'execution_time_ms' => $executionTime,
                'is_dry_run' => $isDryRun
            ]);

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('❌ 桌位检查过程中发生错误: ' . $e->getMessage());

            Log::error('桌位预订检查命令执行失败', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Command::FAILURE;
        }
    }

    /**
     * 执行干运行，只显示会执行的操作而不实际执行
     */
    private function performDryRun(): array
    {
        // 获取会被处理的过期订单（但不实际处理）
        $expiredOrders = \App\Models\Order::where('requires_table', true)
            ->where('table_status', 'pending')
            ->where('checkout_time', '<', now())
            ->with(['table', 'user'])
            ->get();

        $results = [];

        foreach ($expiredOrders as $order) {
            // 模拟判断逻辑，但不实际执行
            $hasConflictingReservation = $this->simulateConflictCheck($order);
            $canAutoExtend = $order->auto_extend_count < 2;

            if ($hasConflictingReservation) {
                $results[] = [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'table_code' => $order->table->table_code ?? 'Unknown',
                    'action' => 'would_force_end',
                    'message' => '将会强制结束 - 有下一个预订',
                    'reason' => 'next_booking'
                ];
            } elseif ($canAutoExtend) {
                $results[] = [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'table_code' => $order->table->table_code ?? 'Unknown',
                    'action' => 'would_auto_extend',
                    'message' => '将会自动延长 30 分钟',
                    'extend_count' => $order->auto_extend_count + 1
                ];
            } else {
                $results[] = [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'table_code' => $order->table->table_code ?? 'Unknown',
                    'action' => 'would_force_end',
                    'message' => '将会强制结束 - 超过最大延长时间',
                    'reason' => 'time_exceeded'
                ];
            }
        }

        return $results;
    }

    /**
     * 模拟冲突检查（用于干运行）
     */
    private function simulateConflictCheck($currentOrder): bool
    {
        $checkTime = now()->addMinutes(30);

        $conflictingOrder = \App\Models\Order::where('table_id', $currentOrder->table_id)
            ->where('id', '!=', $currentOrder->id)
            ->where('requires_table', true)
            ->where('table_status', 'pending')
            ->where('checkin_time', '<=', $checkTime)
            ->first();

        return $conflictingOrder !== null;
    }

    /**
     * 显示处理结果
     */
    private function displayResults(array $results, bool $isDetailed): void
    {
        if (empty($results)) {
            $this->info('📝 没有需要处理的过期订单');
            return;
        }

        $this->info("📊 处理了 " . count($results) . " 个订单:");
        $this->line('');

        // 统计各种操作的数量
        $stats = [
            'auto_extended' => 0,
            'would_auto_extend' => 0,
            'force_ended' => 0,
            'would_force_end' => 0,
            'error' => 0
        ];

        // 创建表格显示结果
        $tableData = [];

        foreach ($results as $result) {
            $stats[$result['action']] = ($stats[$result['action']] ?? 0) + 1;

            if ($isVerbose || $this->option('dry-run')) {
                $tableData[] = [
                    $result['order_number'] ?? 'N/A',
                    $result['table_code'] ?? 'N/A',
                    $this->formatAction($result['action']),
                    $result['message'] ?? 'N/A'
                ];
            }
        }

        // 显示详细表格（在verbose模式或干运行模式下）
        if (!empty($tableData)) {
            $this->table([
                '订单号',
                '桌位',
                '操作',
                '说明'
            ], $tableData);
            $this->line('');
        }

        // 显示统计信息
        $this->info('📈 操作统计:');
        foreach ($stats as $action => $count) {
            if ($count > 0) {
                $actionText = $this->formatAction($action);
                $this->line("   {$actionText}: {$count} 个");
            }
        }
    }

    /**
     * 格式化操作名称为可读的中文
     */
    private function formatAction(string $action): string
    {
        $actionMap = [
            'auto_extended' => '🔄 自动延长',
            'would_auto_extend' => '🔄 将自动延长',
            'force_ended' => '⏹️  强制结束',
            'would_force_end' => '⏹️  将强制结束',
            'checked_in' => '✅ 已入座',
            'checked_out' => '🚪 已结账',
            'error' => '❌ 错误'
        ];

        return $actionMap[$action] ?? $action;
    }
}
