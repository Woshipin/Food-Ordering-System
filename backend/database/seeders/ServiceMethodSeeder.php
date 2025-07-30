<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ServiceMethod; // 引入你的 ServiceMethod Model

class ServiceMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        // 先清空表，防止重复插入
        ServiceMethod::query()->truncate();

        $services = [
            [
                'name'         => 'delivery',
                'display_name' => 'Delivery',
                'description'  => 'Get your food delivered to your doorstep',
                'details'      => 'Delivery fee: RM8.00',
                'fee'          => 8.00,
                'icon_name'    => 'Truck',
                'is_active'    => true,
            ],
            [
                'name'         => 'pickup',
                'display_name' => 'Pick Up',
                'description'  => 'Collect your order from our restaurant',
                'details'      => 'No additional fee',
                'fee'          => 0.00,
                'icon_name'    => 'Store',
                'is_active'    => true,
            ],
            [
                'name'         => 'dine_in',
                'display_name' => 'Dine In',
                'description'  => 'Enjoy your meal at our restaurant',
                'details'      => 'Table service included',
                'fee'          => 0.00,
                'icon_name'    => 'UtensilsCrossed',
                'is_active'    => true,
            ],
        ];

        // 遍历数组并使用 Model 的 create 方法插入数据
        // 这样做的好处是会自动处理 created_at 和 updated_at 时间戳
        foreach ($services as $service) {
            ServiceMethod::create($service);
        }
    }
}
