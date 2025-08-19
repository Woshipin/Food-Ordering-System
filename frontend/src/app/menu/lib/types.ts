// 该文件用于定义菜单页面所需的所有 TypeScript 类型，方便在不同文件中复用。
// This file is used to define all TypeScript types required for the menu page for easy reuse in different files.

// 图片类型定义
export interface ImageType {
  id: number; // 图片的唯一标识符
  url: string; // 图片的 URL 地址
}

// 分类类型定义
export interface CategoryType {
  id: number | string; // 分类的唯一标识符 (可以是数字或字符串 "all")
  name: string; // 分类的名称
  count?: number; // 该分类下菜单项的数量 (可选)
}

// 规格类型定义
export interface VariantType {
  id: number; // 规格的唯一标识符
  name: string; // 规格的名称 (如: 大, 中, 小)
  price_modifier: number; // 价格修正值 (正数表示加价，负数表示减价)
}

// 附加项类型定义
export interface AddonType {
  id: number; // 附加项的唯一标识符
  name: string; // 附加项的名称 (如: 加糖, 加冰)
  price: number; // 附加项的价格
}

// 菜单项基础类型定义
export interface MenuItemType {
  id: number; // 菜单项的唯一标识符
  name: string; // 菜单项的名称
  description: string; // 菜单项的描述
  base_price: number; // 基础价格
  promotion_price: number | null; // 促销价格 (可能为空)
  is_on_promotion: boolean; // 是否正在促销
  status: string; // 菜单项状态
  category: CategoryType | null; // 所属分类 (可能为空)
  images: ImageType[]; // 图片列表
  variants: VariantType[]; // 规格列表
  addons: AddonType[]; // 附加项列表
  rating?: number; // 评分 (可选)
  reviews?: number; // 评论数 (可选)
}