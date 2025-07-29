<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 先清空表，防止重复创建
        User::truncate();

        // 创建一个管理员用户
        User::create([
            'name' => 'Admin',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('123456'), // 密码是 'password'
        ]);

        // 创建一个普通测试用户
        User::create([
            'name' => 'pin',
            'email' => 'pin@gmail.com',
            'password' => Hash::make('123456'), // 密码是 'password'
        ]);

        User::create([
            'name' => 'aaa',
            'email' => 'aaa@gmail.com',
            'password' => Hash::make('123456'), // 密码是 'password'
        ]);

    }
}
