<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class MenuApiResource extends JsonResource
{
    /**
     * 将资源转换为数组。
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // 返回格式化后的菜单数据
        return [
            'id' => $this->id, // 菜单ID
            'name' => $this->name, // 菜单名称
            'description' => $this->description, // 菜单描述
            'base_price' => (float) $this->base_price, // 基础价格，转换为浮点数
            'promotion_price' => $this->promotion_price ? (float) $this->promotion_price : null, // 促销价格，如果存在则转换为浮点数
            'is_on_promotion' => !is_null($this->promotion_price), // 是否处于促销状态
            'status' => $this->menu_status, // 菜单状态
            // 加载并格式化分类信息
            'category' => $this->whenLoaded('category', function () {
                return [
                    'id' => $this->category->id, // 分类ID
                    'name' => $this->category->name, // 分类名称
                ];
            }),
            // 图片信息：进行最严格的过滤和转换
            'images' => $this->whenLoaded('images', function () {
                // 1. 首先确保 images 集合不为空
                if ($this->images->isEmpty()) {
                    return []; // 如果为空，直接返回空数组
                }
                // 2. 过滤掉任何 image_path 为空或无效的记录
                return $this->images->filter(function ($image) {
                    return !empty($image->image_path);
                })
                // 3. 对过滤后的有效记录进行 map 转换
                ->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'url' => url(Storage::url($image->image_path)),
                    ];
                })
                // 4. 使用 values() 重置数组键，确保返回的是一个标准的 JSON 数组
                ->values()->all();
            }),
            // 加载并格式化附加项信息 (仅在需要时加载)
            'addons' => $this->whenLoaded('addons', function () {
                return $this->addons->map(function ($addon) {
                    return [
                        'id' => $addon->id, // 附加项ID
                        'name' => $addon->name, // 附加项名称
                        'price' => (float) $addon->price, // 附加项价格
                    ];
                });
            }),
            // 加载并格式化规格信息 (仅在需要时加载)
            'variants' => $this->whenLoaded('variants', function () {
                return $this->variants->map(function ($variant) {
                    return [
                        'id' => $variant->id, // 规格ID
                        'name' => $variant->name, // 规格名称
                        'price_modifier' => (float) $variant->price_modifier, // 价格修正值
                    ];
                });
            }),
        ];
    }
}
