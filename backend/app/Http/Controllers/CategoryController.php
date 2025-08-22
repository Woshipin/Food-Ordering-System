<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        // Retrieve all categories without pagination
        $categories = Category::latest()->get();

        // Transform the collection
        $transformedCategories = $categories->map(function (Category $category) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                // Add any other fields you want to include
            ];
        });

        // Return a JSON response
        return response()->json($transformedCategories);
    }

    /**
     * Display the specified category.
     *
     * GET /api/categories/{category}
     *
     * @param \App\Models\Category $category
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Category $category): JsonResponse
    {
        // Format the category data
        $formattedData = $this->formatCategoryDetails($category);

        // Return the formatted data wrapped in a 'data' key
        return response()->json([
            'data' => $formattedData,
        ]);
    }

    /**
     * Private helper method to format category details.
     *
     * @param \App\Models\Category $category
     * @return array
     */
    private function formatCategoryDetails(Category $category): array
    {
        return [
            'id' => $category->id,
            'name' => $category->name,
            // Add any other fields you want to include
        ];
    }
}
