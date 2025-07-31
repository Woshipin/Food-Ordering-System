<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\HomeCms;

class HomeCmsSeeder extends Seeder
{
    public function run(): void
    {
        HomeCms::create([
            // Hero Section
            'hero_title_en' => 'Delicious Food',
            'hero_title_zh' => '美味佳肴',
            'hero_title_ms' => 'Makanan Lazat',
            'hero_main_title_en' => 'Delivered to You',
            'hero_main_title_zh' => '送到你门前',
            'hero_main_title_ms' => 'Dihantar kepada Anda',
            'hero_description_en' => 'Fresh and hot meals at your doorstep.',
            'hero_description_zh' => '新鲜热腾腾的美食送上门。',
            'hero_description_ms' => 'Hidangan segar dan panas ke pintu anda.',
            'hero_background_image' => 'images/home/hero.jpg',

            // Story
            'story_title_en' => 'Our Story',
            'story_title_zh' => '我们的故事',
            'story_title_ms' => 'Kisah Kami',
            'story_description_en' => 'Started with passion for food...',
            'story_description_zh' => '始于对美食的热情...',
            'story_description_ms' => 'Bermula dengan semangat terhadap makanan...',
            'story_image' => 'images/home/story.jpg',

            // Why Choose Us 1
            'why_choose_us_1_icon' => 'fa fa-truck',
            'why_choose_us_1_title_en' => 'Fast Delivery',
            'why_choose_us_1_title_zh' => '快速配送',
            'why_choose_us_1_title_ms' => 'Penghantaran Pantas',
            'why_choose_us_1_description_en' => 'Get your food within 30 minutes.',
            'why_choose_us_1_description_zh' => '30分钟内送达。',
            'why_choose_us_1_description_ms' => 'Makanan sampai dalam masa 30 minit.',

            // Why Choose Us 2
            'why_choose_us_2_icon' => 'fa fa-star',
            'why_choose_us_2_title_en' => 'Top Quality',
            'why_choose_us_2_title_zh' => '顶级品质',
            'why_choose_us_2_title_ms' => 'Kualiti Terbaik',
            'why_choose_us_2_description_en' => 'Only the best ingredients.',
            'why_choose_us_2_description_zh' => '只选用最好的食材。',
            'why_choose_us_2_description_ms' => 'Hanya bahan terbaik digunakan.',

            // Why Choose Us 3
            'why_choose_us_3_icon' => 'fa fa-thumbs-up',
            'why_choose_us_3_title_en' => 'Customer Satisfaction',
            'why_choose_us_3_title_zh' => '顾客满意',
            'why_choose_us_3_title_ms' => 'Kepuasan Pelanggan',
            'why_choose_us_3_description_en' => 'We prioritize our customers.',
            'why_choose_us_3_description_zh' => '我们以顾客为先。',
            'why_choose_us_3_description_ms' => 'Kami mengutamakan pelanggan.',

            // Business Hours
            'business_hours_title_en' => 'Business Hours',
            'business_hours_title_zh' => '营业时间',
            'business_hours_title_ms' => 'Waktu Perniagaan',
            'business_hours_description_en' => 'Mon-Sun: 9AM - 10PM',
            'business_hours_description_zh' => '每天早上9点到晚上10点',
            'business_hours_description_ms' => 'Isnin-Ahad: 9 pagi - 10 malam',

            // Contact
            'contact_title_en' => 'Contact Us',
            'contact_title_zh' => '联系我们',
            'contact_title_ms' => 'Hubungi Kami',
            'contact_number' => '+6012-3456789',

            // Delivery
            'delivery_title_en' => 'Delivery Area',
            'delivery_title_zh' => '配送范围',
            'delivery_title_ms' => 'Kawasan Penghantaran',
            'delivery_location' => 'Johor Bahru, Malaysia',
        ]);
    }
}
