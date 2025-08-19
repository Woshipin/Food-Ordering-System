<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class MenuPackageApiResource extends JsonResource
{
    /**
     * 将资源转换为数组。
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id, // 套餐ID
            'name' => $this->name, // 套餐名称
            'description' => $this->description, // 套餐描述
            'base_price' => (float) $this->base_price, // 基础价格
            'promotion_price' => $this->promotion_price ? (float) $this->promotion_price : null, // 促销价格
            'quantity' => $this->quantity, // 数量
            'status' => $this->menu_package_status, // 套餐状态
            // 如果图片存在，则生成完整的 URL；否则返回 null
            'image' => $this->image ? url(Storage::url($this->image)) : null,
            // 加载分类信息
            'category' => $this->whenLoaded('category', function () {
                return [
                    'id' => $this->category->id,
                    'name' => $this->category->name,
                ];
            }),
            // 加载套餐内菜单的简要信息
            'menus' => MenuApiResource::collection($this->whenLoaded('menus')),
            // 加载菜单数量统计
            'menus_count' => $this->whenCounted('menus'),
        ];
    }
}
