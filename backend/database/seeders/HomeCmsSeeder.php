<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\HomeCms;

class HomeCmsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 因为是单例模式，先清空表以防重复创建
        HomeCms::truncate();

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

            'order_now_button_text_en' => 'Order Now',
            'order_now_button_text_zh' => '立即订购',
            'order_now_button_text_ms' => 'Pesan Sekarang',
            'view_menu_button_text_en' => 'View Menu',
            'view_menu_button_text_zh' => '查看菜单',
            'view_menu_button_text_ms' => 'Lihat Menu',

            // Stats
            'stats_satisfied_customers_text_en' => 'Satisfied Customers',
            'stats_satisfied_customers_text_zh' => '满意客户',
            'stats_satisfied_customers_text_ms' => 'Pelanggan Berpuas Hati',
            'stats_avg_delivery_time_text_en' => 'Avg. Delivery Time',
            'stats_avg_delivery_time_text_zh' => '平均配送时间',
            'stats_avg_delivery_time_text_ms' => 'Masa Penghantaran Purata',
            'stats_user_rating_text_en' => 'User Rating',
            'stats_user_rating_text_zh' => '用户评分',
            'stats_user_rating_text_ms' => 'Penilaian Pengguna',
            'stats_all_day_service_text_en' => 'All Day Service',
            'stats_all_day_service_text_zh' => '全天服务',
            'stats_all_day_service_text_ms' => 'Perkhidmatan Sepanjang Hari',

            // Popular Categories
            'popular_categories_title_en' => 'Popular Categories',
            'popular_categories_title_zh' => '热门分类',
            'popular_categories_title_ms' => 'Kategori Popular',

            // Today Special
            'today_special_title_en' => "Today's Special",
            'today_special_title_zh' => '今日特价',
            'today_special_title_ms' => 'Istimewa Hari Ini',
            'today_special_description_en' => 'Check out our special dish for today!',
            'today_special_description_zh' => '查看我们今天的特价菜！',
            'today_special_description_ms' => 'Lihat hidangan istimewa kami untuk hari ini!',

            // Why Choose Us
            'why_choose_us_title_en' => 'Why Choose Us',
            'why_choose_us_title_zh' => '为什么选择我们',
            'why_choose_us_title_ms' => 'Kenapa Pilih Kami',
            'feature_fast_delivery_title_en' => 'Fast Delivery',
            'feature_fast_delivery_title_zh' => '快速配送',
            'feature_fast_delivery_title_ms' => 'Penghantaran Pantas',
            'feature_fast_delivery_desc_en' => 'Get your food delivered in no time.',
            'feature_fast_delivery_desc_zh' => '您的食物将立即送达。',
            'feature_fast_delivery_desc_ms' => 'Dapatkan makanan anda dihantar dalam masa yang singkat.',
            'feature_quality_ingredients_title_en' => 'Quality Ingredients',
            'feature_quality_ingredients_title_zh' => '优质食材',
            'feature_quality_ingredients_title_ms' => 'Bahan Berkualiti',
            'feature_quality_ingredients_desc_en' => 'We use only the freshest ingredients.',
            'feature_quality_ingredients_desc_zh' => '我们只使用最新鲜的食材。',
            'feature_quality_ingredients_desc_ms' => 'Kami hanya menggunakan bahan-bahan yang paling segar.',
            'feature_quality_guarantee_title_en' => 'Quality Guarantee',
            'feature_quality_guarantee_title_zh' => '品质保证',
            'feature_quality_guarantee_title_ms' => 'Jaminan Kualiti',
            'feature_quality_guarantee_desc_en' => 'We guarantee the quality of our food.',
            'feature_quality_guarantee_desc_zh' => '我们保证食物的品质。',
            'feature_quality_guarantee_desc_ms' => 'Kami menjamin kualiti makanan kami.',

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

            // Footer
            'footer_slogan_en' => 'Your favorite food, delivered.',
            'footer_slogan_zh' => '您最喜爱的食物，送到您家。',
            'footer_slogan_ms' => 'Makanan kegemaran anda, dihantar.',
            'footer_privacy_policy_text_en' => 'Privacy Policy',
            'footer_privacy_policy_text_zh' => '隐私政策',
            'footer_privacy_policy_text_ms' => 'Dasar Privasi',
            'footer_terms_of_service_text_en' => 'Terms of Service',
            'footer_terms_of_service_text_zh' => '服务条款',
            'footer_terms_of_service_text_ms' => 'Syarat Perkhidmatan',
            'footer_help_center_text_en' => 'Help Center',
            'footer_help_center_text_zh' => '帮助中心',
            'footer_help_center_text_ms' => 'Pusat Bantuan',
            'footer_all_rights_reserved_text_en' => 'All rights reserved.',
            'footer_all_rights_reserved_text_zh' => '版权所有。',
            'footer_all_rights_reserved_text_ms' => 'Hak cipta terpelihara.',
        ]);
    }
}
