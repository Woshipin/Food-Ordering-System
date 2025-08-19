// 该文件用于处理所有与套餐相关的 API 数据请求，将数据获取逻辑与 UI 组件分离。
// This file is used to handle all API data requests related to packages, separating data fetching logic from UI components.

import axios from "../../../lib/axios"; // 导入自定义的 axios 实例
import { PackageListItemType, PackageDetailType } from "./types"; // 导入类型定义

/**
 * 获取所有套餐列表。
 * Fetches the list of all menu packages.
 * @returns {Promise<PackageListItemType[]>} 返回一个包含所有套餐项的 Promise 数组。
 * @throws {Error} 如果网络请求失败，则抛出错误。
 */
export async function fetchPackages(): Promise<PackageListItemType[]> {
  try {
    // 发送 GET 请求到 /api/menu-packages
    const response = await axios.get<{ data: PackageListItemType[] }>("/menu-packages");
    // API 返回的数据在 response.data.data 中
    return response.data.data;
  } catch (error) {
    // 如果请求出错，在控制台打印错误信息
    console.error("获取套餐数据失败 (Failed to fetch packages):", error);
    // 抛出错误，以便调用者可以捕获并处理
    throw new Error("获取套餐数据失败 (Failed to fetch packages).");
  }
}

/**
 * 根据 ID 获取单个套餐的详细信息。
 * Fetches the details of a single menu package by its ID.
 * @param {string} id - 套餐的 ID。
 * @returns {Promise<PackageDetailType>} 返回单个套餐的详细信息。
 * @throws {Error} 如果网络请求失败，则抛出错误。
 */
export async function fetchPackageById(id: string): Promise<PackageDetailType> {
  try {
    // 发送 GET 请求到 /api/menu-packages/{id}
    const response = await axios.get<{ data: PackageDetailType }>(`/menu-packages/${id}`);
    // API 返回的数据在 response.data.data 中
    return response.data.data;
  } catch (error) {
    // 如果请求出错，在控制台打印错误信息
    console.error(`获取套餐 #${id} 失败 (Failed to fetch package #${id}):`, error);
    // 抛出错误
    throw new Error(`获取套餐 #${id} 失败 (Failed to fetch package #${id}).`);
  }
}