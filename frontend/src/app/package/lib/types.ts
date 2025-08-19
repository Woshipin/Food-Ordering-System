// 该文件用于定义套餐页面所需的所有 TypeScript 类型，方便在不同文件中复用。
// This file is used to define all TypeScript types required for the package page for easy reuse in different files.

import { MenuItemType } from "@/app/menu/lib/types";

// 套餐分类类型定义
export interface PackageCategoryType {
  id: number;
  name: string;
}

// 套餐内菜单项的简要类型 (用于列表页)
export interface SimpleMenuType {
  id: number;
  name: string;
}

// 套餐列表项类型定义 (用于 package/page.tsx)
export interface PackageListItemType {
  id: number;
  name: string;
  description: string;
  base_price: number;
  promotion_price: number | null;
  quantity: number;
  status: boolean;
  image: string | null;
  menus_count: number;
  category?: PackageCategoryType;
  menus?: SimpleMenuType[];
  rating?: number; // 前端模拟字段
  reviews?: number; // 前端模拟字段
}

// 套餐详情页内嵌的菜单项类型 (包含 addons 和 variants)
export interface PackageMenuType extends MenuItemType {}

// 套餐详情类型定义 (用于 package/[id]/page.tsx)
export interface PackageDetailType {
  id: number;
  name: string;
  description: string;
  base_price: number;
  promotion_price: number | null;
  image: string | null;
  menus: PackageMenuType[];
  category: PackageCategoryType | null;
}