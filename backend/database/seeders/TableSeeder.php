<?php

namespace Database\Seeders;

use App\Models\Table;
use Illuminate\Database\Seeder;

/**
 * 桌位資料填充器
 * 用於創建測試用的桌位數據
 */
class TableSeeder extends Seeder
{
    /**
     * 執行資料庫填充
     *
     * @return void
     */
    public function run(): void
    {
        // 清空現有數據（僅在開發環境）
        if (app()->environment(['local', 'testing'])) {
            // 使用 truncate 更高效，並會重置自增ID
            Table::truncate();
        }

        // 創建桌位數據
        $tables = [
            // === 普通桌位（A區域） ===
            ['table_code' => 'A01', 'description' => '靠窗雙人桌，光線充足', 'capacity' => 2, 'location' => '一樓A區靠窗', 'is_available' => true],
            ['table_code' => 'A02', 'description' => '標準四人桌，寬敞舒適', 'capacity' => 4, 'location' => '一樓A區中央', 'is_available' => true],
            ['table_code' => 'A03', 'description' => '四人方桌，適合朋友聚餐', 'capacity' => 4, 'location' => '一樓A區中央', 'is_available' => true],
            ['table_code' => 'A04', 'description' => '六人長桌，適合家庭聚餐', 'capacity' => 6, 'location' => '一樓A區後側', 'is_available' => true],

            // === 普通桌位（B區域） ===
            ['table_code' => 'B01', 'description' => '雙人卡座，隱私性較好', 'capacity' => 2, 'location' => '一樓B區卡座', 'is_available' => true],
            ['table_code' => 'B02', 'description' => '四人卡座，舒適度佳', 'capacity' => 4, 'location' => '一樓B區卡座', 'is_available' => true],
            ['table_code' => 'B03', 'description' => '圓桌設計，適合聚餐', 'capacity' => 6, 'location' => '一樓B區圓桌區', 'is_available' => true],

            // === VIP桌位 ===
            ['table_code' => 'VIP01', 'description' => 'VIP雙人桌，享受專屬服務', 'capacity' => 2, 'location' => '二樓VIP區', 'is_available' => true],
            ['table_code' => 'VIP02', 'description' => 'VIP四人桌，配備高級餐具', 'capacity' => 4, 'location' => '二樓VIP區', 'is_available' => true],
            ['table_code' => 'VIP03', 'description' => 'VIP大桌，適合重要商務宴請', 'capacity' => 8, 'location' => '二樓VIP區', 'is_available' => true],

            // === 包廂 ===
            ['table_code' => '雅閣', 'description' => '豪華包廂，配備獨立音響', 'capacity' => 10, 'location' => '三樓包廂區', 'is_available' => true],
            ['table_code' => '竹軒', 'description' => '中式主題包廂，古典裝潢', 'capacity' => 12, 'location' => '三樓包廂區', 'is_available' => true],
            ['table_code' => '蘭苑', 'description' => '溫馨小包廂，適合家庭聚會', 'capacity' => 6, 'location' => '三樓包廂區', 'is_available' => true],

            // === 吧台座位 ===
            ['table_code' => 'BAR01', 'description' => '吧台高腳椅', 'capacity' => 1, 'location' => '一樓吧台區', 'is_available' => true],
            ['table_code' => 'BAR02', 'description' => '吧台雙人座', 'capacity' => 2, 'location' => '一樓吧台區', 'is_available' => true],
            ['table_code' => 'BAR03', 'description' => '吧台單人座', 'capacity' => 1, 'location' => '一樓吧台區', 'is_available' => true],

            // === 戶外桌位（季節性開放） ===
            ['table_code' => 'OUT01', 'description' => '戶外花園雙人桌', 'capacity' => 2, 'location' => '室外露台花園', 'is_available' => true],
            ['table_code' => 'OUT02', 'description' => '戶外四人桌，適合朋友聚會', 'capacity' => 4, 'location' => '室外露台花園', 'is_available' => true],
            ['table_code' => 'OUT03', 'description' => '戶外大桌，冬季暫停開放', 'capacity' => 6, 'location' => '室外露台花園', 'is_available' => false],
        ];


        // 批量創建桌位
        foreach ($tables as $tableData) {
            Table::create($tableData);
        }

        $this->command->info('桌位數據已成功創建！');
        $this->command->info('共創建了 ' . count($tables) . ' 張桌位');

        // 顯示創建的桌位統計
        $this->displayTableStatistics();
    }

    /**
     * 顯示桌位統計信息
     */
    private function displayTableStatistics(): void
    {
        $totalCapacity   = Table::sum('capacity');
        $availableTables = Table::where('is_available', true)->count();
        $totalTables     = Table::count();

        $this->command->info("\n" . '================== 總體統計 ==================');
        $this->command->line("🪑 總桌位數: <fg=green>{$totalTables}</>");
        $this->command->line("✅ 可用桌位: <fg=green>{$availableTables}</>");
        $this->command->line("👥 總容納人數: <fg=green>{$totalCapacity} 人</>");
        if ($totalTables > 0) {
            $this->command->line("📊 平均每桌容量: <fg=green>" . round($totalCapacity / $totalTables, 1) . " 人</>");
        }
        $this->command->info('==============================================');
    }
}
