/**
 * =====================================================================================
 * @file        utils.ts
 * @brief       通用的辅助函数工具集。
 * @details
 *              这个文件包含一些在整个应用中可能被复用的、与特定业务逻辑无关的
 *              通用辅助函数。目前，它主要包含一个用于处理和合并 Tailwind CSS
 *              类名的函数 `cn`。
 * 
 * @purpose     提供一个中心化的位置来存放可复用的工具函数，保持代码的整洁和
 *              DRY (Don't Repeat Yourself) 原则。
 * 
 * @usage       在任何需要动态合并 CSS 类名的组件中导入并使用 `cn` 函数。
 *              `import { cn } from '@/lib/utils';`
 *              `<div className={cn("base-class", { "conditional-class": isActive }, "another-class")}>...</div>`
 * =====================================================================================
 */

import { type ClassValue, clsx } from "clsx"; // 导入 `clsx` 库，它是一个小巧的工具，用于根据条件轻松地构造 CSS 类名字符串。
import { twMerge } from "tailwind-merge"; // 导入 `tailwind-merge` 库，它用于智能地合并 Tailwind CSS 类，并解决类名冲突。

/**
 * @function    cn
 * @description 一个辅助函数，用于将多个 CSS 类名（包括条件类名）智能地合并成一个单一的字符串。
 * @param       {...ClassValue[]} inputs - 一个或多个参数，可以是字符串、对象或数组，代表需要合并的 CSS 类。
 * @returns     {string} - 返回一个经过处理和优化的、最终的 CSS 类名字符串。
 * 
 * @example
 * // 示例 1: 基本用法
 * cn("p-4", "bg-red-500"); // => "p-4 bg-red-500"
 * 
 * // 示例 2: 条件类名
 * const isActive = true;
 * cn("p-4", { "bg-red-500": isActive, "bg-gray-500": !isActive }); // => "p-4 bg-red-500"
 * 
 * // 示例 3: 解决冲突 (tailwind-merge 的作用)
 * cn("p-4 bg-red-500", "p-8"); // => "bg-red-500 p-8" (p-8 会覆盖 p-4)
 * cn("px-2 py-2", "p-4");      // => "p-4" (p-4 会覆盖 px-2 和 py-2)
 */
export function cn(...inputs: ClassValue[]): string {
  // 1. 首先，使用 `clsx` 处理输入。
  //    `clsx` 会将所有参数（字符串、对象、数组）转换成一个单一的、由空格分隔的类名字符串。
  //    例如: clsx("p-4", { "bg-red-500": true }) => "p-4 bg-red-500"
  //
  // 2. 然后，将 `clsx` 的输出传递给 `twMerge`。
  //    `twMerge` 会解析这个字符串，并根据 Tailwind CSS 的规则解决冲突。
  //    例如: twMerge("px-2 py-2 p-4") => "p-4"
  return twMerge(clsx(inputs));
}
