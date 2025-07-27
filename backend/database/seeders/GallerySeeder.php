<?php

namespace Database\Seeders;

use App\Models\Gallery;
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

        $categories = ['Food', 'Drink', 'Dessert', 'Interior'];

        foreach (range(1, 10) as $i) {
            Gallery::create([
                'title'          => "Gallery Image $i",
                'description'    => "This is a description for gallery image $i.",
                'category'       => Arr::random($categories),
                'image'          => 'images/' . Arr::random($availableImages),
                'gallery_status' => true,
            ]);
        }

        $this->command->info('✅ Seeded 10 gallery items.');
    }
}
