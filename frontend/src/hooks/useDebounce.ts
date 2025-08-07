/**
 * @file useDebounce.ts
 * @description 自定义 React Hook，用于实现值的 debounce（防抖）效果。
 * 当一个值在指定的时间延迟内持续变化时，这个 Hook 只会返回最后一次更新的值。
 * 这对于性能优化非常有用，例如，可以避免在用户快速输入时频繁触发 API 调用。
 */

import { useState, useEffect } from 'react'; // 导入 React 的 useState 和 useEffect Hooks

/**
 * 一个自定义 Hook，用于延迟更新一个值（debounce）。
 * @template T 值的类型。
 * @param {T} value 需要进行 debounce 的值。
 * @param {number} delay 延迟的时间，以毫秒为单位。
 * @returns {T} 返回经过 debounce 处理的值。
 */
export function useDebounce<T>(value: T, delay: number): T {
  // 创建一个 state 来存储 debounce 后的值
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  // 使用 useEffect 来处理 debounce 逻辑
  useEffect(() => {
    // 设置一个定时器，在指定的延迟后更新 debounce 后的值
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 清理函数：在下一次 effect 执行前或组件卸载时，清除上一个定时器
    // 这确保了只有在用户停止输入指定延迟时间后，值才会被更新
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // 依赖项数组：只有当 value 或 delay 发生变化时，才重新执行 effect

  // 返回最终的 debounce 后的值
  return debouncedValue;
}