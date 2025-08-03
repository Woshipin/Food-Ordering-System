<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Address;
use Illuminate\Support\Facades\DB;

class AddressSeeder extends Seeder
{
    /**
     * 运行数据库填充。
     *
     * @return void
     */
    public function run(): void
    {
        // 1. 开始前先清空 addresses 表，防止重复运行此 seeder 时数据重复
        Address::truncate();

        // 2. 获取所有用户，因为地址必须属于某个用户
        $users = User::all();

        // 如果没有任何用户，则无法继续，输出提示信息
        if ($users->isEmpty()) {
            $this->command->info("用户表中没有数据，无法创建地址。请先运行 UserSeeder。");
            return;
        }

        // 3. 为每个用户创建几个地址
        foreach ($users as $user) {
            // 为每个用户创建的第一个地址，我们将其设为默认地址
            Address::create([
                'user_id' => $user->id,
                'name' => $user->name, // 直接使用用户名作为收件人名
                'phone' => '138****8888',
                'address' => '北京市朝阳区三里屯街道工体北路8号',
                'building' => 'A栋',
                'floor' => '1201室',
                'is_default' => true, // 第一个地址设为默认
            ]);

            // 为同一个用户创建第二个地址（非默认）
            Address::create([
                'user_id' => $user->id,
                'name' => $user->name,
                'phone' => '159****9999',
                'address' => '上海市浦东新区世纪大道100号',
                'building' => '环球金融中心',
                'floor' => '58楼',
                'is_default' => false,
            ]);

            // 如果是第一个用户，额外再给他创建一个地址，让数据看起来更丰富
            if ($user->id === 1) {
                 Address::create([
                    'user_id' => $user->id,
                    'name' => '王女士', // 使用一个不同的收件人名
                    'phone' => '186****1234',
                    'address' => '广东省深圳市南山区科技园',
                    'building' => '科兴科学园',
                    'floor' => 'B4单元10层',
                    'is_default' => false,
                ]);
            }
        }
    }
}
