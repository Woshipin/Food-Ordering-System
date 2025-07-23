<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 使用 $this->call() 来执行指定的 seeder
        $this->call([
            UserSeeder::class,
            CategorySeeder::class,
            AddonSeeder::class,
            VariantSeeder::class,
        ]);
    }
}
