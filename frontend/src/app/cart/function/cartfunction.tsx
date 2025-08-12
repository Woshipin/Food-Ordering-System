// @/app/cart/cartfunction.tsx
// 这个文件包含购物车页面使用的所有辅助函数和功能组件。
// 将这些函数分离出来有助于保持主页面组件的整洁，并使逻辑更易于管理和测试。

import React from "react";
import * as LucideIcons from "lucide-react";
import { CartMenuItem, CartPackageItem, CartData } from "../lib/lib"; // 从lib.ts导入类型

/**
 * 根据两个地理坐标点（纬度和经度）计算它们之间的距离（单位：公里）。
 * 使用Haversine公式进行计算。
 * @param lat1 - 第一个点的纬度
 * @param lon1 - 第一个点的经度
 * @param lat2 - 第二个点的纬度
 * @param lon2 - 第二个点的经度
 * @returns 返回计算出的距离（公里），如果输入无效则返回0。
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  // 确保所有坐标都有效
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // 地球半径（公里）
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // 返回最终距离
};

/**
 * 动态渲染Lucide图标的组件。
 * @param name - 要渲染的图标名称 (必须是LucideIcons库中存在的图标名)
 * @param props - 传递给图标组件的其他属性 (如 className, size等)
 * @returns 返回对应的Lucide图标组件，如果找不到则返回一个默认的帮助图标。
 */
export const Icon = ({
  name,
  ...props
}: { name: string } & LucideIcons.LucideProps) => {
  // 从LucideIcons库中动态获取图标组件
  const LucideIcon = LucideIcons[
    name as keyof typeof LucideIcons
  ] as React.ComponentType<LucideIcons.LucideProps>;
  // 如果找不到指定的图标，则渲染一个默认的HelpCircle图标
  if (!LucideIcon) {
    return <LucideIcons.HelpCircle {...props} />;
  }
  // 渲染找到的图标
  return <LucideIcon {...props} />;
};

/**
 * 将相对图片路径转换为完整的URL。
 * @param imagePath - 图片的路径 (可以是null, undefined, 完整的URL, 或相对路径)
 * @returns 返回一个完整的图片URL，如果路径无效则返回一个占位图片的路径。
 */
export const getFullImageUrl = (
  imagePath: string | null | undefined
): string => {
  // 如果路径为空，返回占位图
  if (!imagePath) {
    return "/placeholder.svg";
  }
  // 如果路径已经是完整的URL，直接返回
  if (imagePath.startsWith("http")) {
    return imagePath;
  }
  // 如果路径是Laravel storage的相对路径，则拼接成完整的URL
  if (imagePath.startsWith("/storage/")) {
    return `http://127.0.0.1:8000${imagePath}`;
  }
  // 其他情况，默认拼接storage路径
  return `http://127.0.0.1:8000/storage/${imagePath}`;
};

/**
 * 计算单个菜单项的总价。
 * 总价 = (基础价格/促销价 + 附加项总价 + 规格总价) * 数量
 * @param item - 购物车中的菜单项对象
 * @returns 返回该菜单项的总价。
 */
export const calculateItemTotal = (item: CartMenuItem) => {
  // 优先使用促销价，否则使用基础价格
  const basePrice = item.promotion_price ?? item.base_price;
  // 计算所有附加选项的总价
  const addonsPrice = item.addons.reduce(
    (sum, addon) => sum + Number(addon.addon_price),
    0
  );
  // 计算所有规格的总价
  const variantsPrice = item.variants.reduce(
    (sum, variant) => sum + Number(variant.variant_price),
    0
  );
  // 返回最终价格
  return (Number(basePrice) + addonsPrice + variantsPrice) * item.quantity;
};

/**
 * 计算套餐的总价。
 * 总价 = (套餐价格/促销价 + 套餐内所有菜单的附加项和规格总价) * 数量
 * @param pkg - 购物车中的套餐对象
 * @returns 返回该套餐的总价。
 */
export const calculatePackageTotal = (pkg: CartPackageItem) => {
  // 优先使用促销价，否则使用基础价格
  const basePrice = pkg.promotion_price ?? pkg.package_price;
  let packageExtras = 0;
  // 遍历套餐内的每个菜单，累加其附加项和规格的价格
  pkg.menus.forEach((menu) => {
    packageExtras += menu.addons.reduce(
      (sum, addon) => sum + Number(addon.addon_price),
      0
    );
    packageExtras += menu.variants.reduce(
      (sum, variant) => sum + Number(variant.variant_price),
      0
    );
  });
  // 返回最终价格
  return (Number(basePrice) + packageExtras) * pkg.quantity;
};

/**
 * 更新购物车中菜单项的数量。
 * @param menuId - 要更新的菜单项的ID。
 * @param newQuantity - 新的数量。如果小于等于0，则从购物车中移除该项。
 * @param prevCart - 当前的购物车状态。
 * @returns 返回更新后的购物车数据。
 */
export const handleUpdateMenuQuantity = (
  menuId: number,
  newQuantity: number,
  prevCart: CartData | null
): CartData | null => {
  // 如果购物车为空，则不执行任何操作
  if (!prevCart) return null;
  // 深拷贝购物车数据，避免直接修改原始状态
  const updatedCart = JSON.parse(JSON.stringify(prevCart));

  if (newQuantity > 0) {
    // 如果新数量大于0，则找到该菜单项并更新其数量
    const item = updatedCart.menu_items.find(
      (item: CartMenuItem) => item.id === menuId
    );
    if (item) item.quantity = newQuantity;
  } else {
    // 如果新数量为0或更少，则从购物车中过滤掉（即删除）该菜单项
    updatedCart.menu_items = updatedCart.menu_items.filter(
      (item: CartMenuItem) => item.id !== menuId
    );
  }

  // 返回更新后的购物车对象
  return updatedCart;
};

/**
 * 更新购物车中套餐的数量。
 * @param packageId - 要更新的套餐的ID。
 * @param newQuantity - 新的数量。如果小于等于0，则从购物车中移除该项。
 * @param prevCart - 当前的购物车状态。
 * @returns 返回更新后的购物车数据。
 */
export const handleUpdatePackageQuantity = (
  packageId: number,
  newQuantity: number,
  prevCart: CartData | null
): CartData | null => {
  // 如果购物车为空，则不执行任何操作
  if (!prevCart) return null;
  // 深拷贝购物车数据，避免直接修改原始状态
  const updatedCart = JSON.parse(JSON.stringify(prevCart));

  if (newQuantity > 0) {
    // 如果新数量大于0，则找到该套餐并更新其数量
    const pkg = updatedCart.package_items.find(
      (pkg: CartPackageItem) => pkg.id === packageId
    );
    if (pkg) pkg.quantity = newQuantity;
  } else {
    // 如果新数量为0或更少，则从购物车中过滤掉（即删除）该套餐
    updatedCart.package_items = updatedCart.package_items.filter(
      (pkg: CartPackageItem) => pkg.id !== packageId
    );
  }

  // 返回更新后的购物车对象
  return updatedCart;
};
