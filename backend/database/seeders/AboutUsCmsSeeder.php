<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AboutUsCms;
use Illuminate\Support\Facades\DB;
use App\Models\Achievement;
use App\Models\OurTeam;
use App\Models\OurValue;

class AboutUsCmsSeeder extends Seeder
{
    public function run(): void
    {
        AboutUsCms::create([
            'hero_title_en' => 'About',
            'hero_title_zh' => '关于我们',
            'hero_title_ms' => 'Tentang Kami',
            'hero_description_en' => 'Learn about our journey and mission.',
            'hero_description_zh' => '了解我们的旅程和使命。',
            'hero_description_ms' => 'Ketahui tentang perjalanan dan misi kami.',
            'story_title_en' => 'Our Story',
            'story_title_zh' => '我们的故事',
            'story_title_ms' => 'Kisah Kami',
            'story_image' => 'story.jpg',
            'story_description_en' => 'We started in 2010...',
            'story_description_zh' => '我们在2010年开始...',
            'story_description_ms' => 'Kami bermula pada tahun 2010...',
        ]);

        Achievement::create([
            'icon' => 'star',
            'value' => '1000+',
            'label_en' => 'Satisfied Customers',
            'label_zh' => '满意的客户',
            'label_ms' => 'Pelanggan Puas Hati',
        ]);

        OurTeam::create([
            'name' => 'John Doe',
            'image' => 'john.jpg',
            'position_en' => 'CEO',
            'position_zh' => '首席执行官',
            'position_ms' => 'CEO',
            'description_en' => 'Leader of the company.',
            'description_zh' => '公司的领导者。',
            'description_ms' => 'Pemimpin syarikat.',
        ]);

        OurValue::create([
            'title_en' => 'Integrity',
            'title_zh' => '诚信',
            'title_ms' => 'Integriti',
            'icon' => 'shield',
            'description_en' => 'We value honesty and transparency.',
            'description_zh' => '我们重视诚实和透明。',
            'description_ms' => 'Kami menghargai kejujuran dan ketelusan.',
        ]);
    }
}
