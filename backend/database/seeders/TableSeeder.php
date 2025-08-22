<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Table; // 引入 Table 模型

class TableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 在填充数据前，清空已有的数据，避免重复
        Table::truncate();

        // 定义要插入的餐桌数据
        $tables = [
            [
                'name' => 'A1',
                'description' => '靠窗双人桌',
                'capacity' => 2,
                'location' => '窗边区域',
                'is_available' => true,
            ],
            [
                'name' => 'A2',
                'description' => '舒适四人卡座',
                'capacity' => 4,
                'location' => '大厅中央',
                'is_available' => true,
            ],
            [
                'name' => 'B1',
                'description' => '安静角落桌',
                'capacity' => 2,
                'location' => '角落区域',
                'is_available' => false, // 假设这张桌子正在被占用
            ],
            [
                'name' => 'C1',
                'description' => '适合家庭聚餐的六人桌',
                'capacity' => 6,
                'location' => '大厅中央',
                'is_available' => true,
            ],
            [
                'name' => 'VIP-1',
                'description' => '豪华包间，可容纳10人',
                'capacity' => 10,
                'location' => '包间区域',
                'is_available' => true,
            ],
            [
                'name' => 'Patio-1',
                'description' => null, // 描述可以为空
                'capacity' => 4,
                'location' => '户外庭院',
                'is_available' => true,
            ],
        ];

        // 循环遍历数组并创建记录
        foreach ($tables as $tableData) {
            Table::create($tableData);
        }
    }
}
