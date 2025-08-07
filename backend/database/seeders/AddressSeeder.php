<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Address;

class AddressSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 清空 addresses 表
        Address::truncate();

        // 获取所有用户
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->info("用户表中没有数据，无法创建地址。请先运行 UserSeeder。");
            return;
        }

        foreach ($users as $user) {
            // 默认地址
            Address::create([
                'user_id' => $user->id,
                'name' => $user->name,
                'phone' => '012-3456789',
                'address' => 'No. 12, Jalan Indah 15/3, Taman Bukit Indah, 81200 Johor Bahru, Johor, Malaysia',
                'building' => 'Block A',
                'floor' => 'Level 3, Unit 3A',
                'is_default' => true,
                'latitude' => 1.4810,
                'longitude' => 103.6544,
            ]);

            // 第二个地址（非默认）
            Address::create([
                'user_id' => $user->id,
                'name' => $user->name,
                'phone' => '017-9876543',
                'address' => '91, Jalan Indah 1/23, Taman Bukit Indah, 81200 Johor Bahru, Johor Darul Tazim Malaysia',
                'building' => 'Block B',
                'floor' => 'Ground Floor, Lot 2',
                'is_default' => false,
                'latitude' => 1.4838,
                'longitude' => 103.6582,
            ]);

            // 如果是第一个用户，额外添加一个地址
            if ($user->id === 1) {
                Address::create([
                    'user_id' => $user->id,
                    'name' => 'Puan Lim',
                    'phone' => '018-2233445',
                    'address' => '8, Jalan Sutera Danga, Taman Sutera Utama, 81300 Skudai, Johor, Malaysia',
                    'building' => 'Sutera Mall Residence',
                    'floor' => '12A-05',
                    'is_default' => false,
                    'latitude' => 1.5159,
                    'longitude' => 103.6693,
                ]);
            }
        }
    }
}
