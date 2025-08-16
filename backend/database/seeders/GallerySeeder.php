<?php

namespace Database\Seeders;

use App\Models\Gallery;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;

class GallerySeeder extends Seeder
{
    public function run(): void
    {
        $availableImages = [
            'beef.jpg', 'beefsoup.jpg', 'chicken.jpg', 'cucumber.jpg',
            'fish.jpg', 'kungpao.jpg', 'lotus.jpg', 'mango.jpg',
            'shrimp.jpg', 'sourspicy.jpg', 'tea.jpg', 'wine.jpg',
        ];

        // 从数据库中获取所有分类的 id
        $categories = Category::pluck('id')->toArray();

        foreach (range(1, 10) as $i) {
            Gallery::create([
                'title'          => "Gallery Image $i",
                'description'    => "This is a description for gallery image $i.",
                'category_id'    => Arr::random($categories), // 随机选择一个 category_id
                'image'          => 'images/' . Arr::random($availableImages),
                'gallery_status' => true,
            ]);
        }

        $this->command->info('✅ Seeded 10 gallery items with categories from DB.');
    }
}
