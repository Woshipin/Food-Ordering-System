// 该文件用于处理所有与菜单相关的 API 数据请求，将数据获取逻辑与 UI 组件分离。
// This file is used to handle all API data requests related to the menu, separating data fetching logic from UI components.

import axios from "../../../lib/axios"; // 导入自定义的 axios 实例，已包含基础 URL 和拦截器等配置
import { MenuItemType, CategoryType } from "./types"; // 导入类型定义

/**
 * 获取所有菜单项列表。
 * Fetches the list of all menu items.
 * @returns {Promise<MenuItemType[]>} 返回一个包含所有菜单项的 Promise 数组。
 * @throws {Error} 如果网络请求失败，则抛出错误。
 */
export async function fetchMenus(): Promise<MenuItemType[]> {
  try {
    // 发送 GET 请求到 /api/menus
    const response = await axios.get<{ data: MenuItemType[] }>("/menus");
    // API 返回的数据在 response.data.data 中
    return response.data.data;
  } catch (error) {
    // 如果请求出错，在控制台打印错误信息
    console.error("获取菜单数据失败 (Failed to fetch menus):", error);
    // 抛出错误，以便调用者可以捕获并处理
    throw new Error("获取菜单数据失败 (Failed to fetch menus).");
  }
}

/**
 * 获取所有分类列表。
 * Fetches the list of all categories.
 * @returns {Promise<CategoryType[]>} 返回一个包含所有分类的 Promise 数组。
 * @throws {Error} 如果网络请求失败，则抛出错误。
 */
export async function fetchCategories(): Promise<CategoryType[]> {
  try {
    // 发送 GET 请求到 /api/categories
    const response = await axios.get<CategoryType[]>("/categories");
    // 直接返回 API 数据
    return response.data;
  } catch (error) {
    // 如果请求出错，在控制台打印错误信息
    console.error("获取分类数据失败 (Failed to fetch categories):", error);
    // 抛出错误
    throw new Error("获取分类数据失败 (Failed to fetch categories).");
  }
}

/**
 * 根据 ID 获取单个菜单项的详细信息。
 * Fetches the details of a single menu item by its ID.
 * @param {string} id - 菜单项的 ID。
 * @returns {Promise<MenuItemType>} 返回单个菜单项的详细信息。
 * @throws {Error} 如果网络请求失败，则抛出错误。
 */
export async function fetchMenuById(id: string): Promise<MenuItemType> {
  try {
    // 发送 GET 请求到 /api/menus/{id}
    const response = await axios.get<{ data: MenuItemType }>(`/menus/${id}`);
    // API 返回的数据在 response.data.data 中
    return response.data.data;
  } catch (error) {
    // 如果请求出错，在控制台打印错误信息
    console.error(`获取菜单项 #${id} 失败 (Failed to fetch menu item #${id}):`, error);
    // 抛出错误
    throw new Error(`获取菜单项 #${id} 失败 (Failed to fetch menu item #${id}).`);
  }
}