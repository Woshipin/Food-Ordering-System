<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PaymentMethod; // 引入你的 PaymentMethod Model

class PaymentMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        // 先清空表，防止重复插入
        PaymentMethod::query()->truncate();

        $payments = [
            [
                'name'         => 'credit_card',
                'display_name' => 'Credit Card',
                'description'  => 'Pay securely with your credit card',
                'icon_name'    => 'CreditCard',
                'is_active'    => true,
            ],
            [
                'name'         => 'debit_card',
                'display_name' => 'Debit Card',
                'description'  => 'Pay directly from your bank account',
                'icon_name'    => 'Wallet',
                'is_active'    => true,
            ],
            [
                'name'         => 'cash',
                'display_name' => 'Cash',
                'description'  => 'Pay with cash upon delivery/pickup',
                'icon_name'    => 'Banknote',
                'is_active'    => true,
            ],
            [
                'name'         => 'tng_ewallet',
                'display_name' => 'Touch \'n Go eWallet',
                'description'  => 'Quick and secure mobile payment',
                'icon_name'    => 'Smartphone',
                'is_active'    => true,
            ],
        ];

        // 遍历数组并使用 Model 的 create 方法插入数据
        foreach ($payments as $payment) {
            PaymentMethod::create($payment);
        }
    }
}
