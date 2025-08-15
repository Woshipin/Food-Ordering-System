/**
 * =====================================================================================
 * @file        useDebounce.ts
 * @brief       一个自定义的 React Hook，用于实现值的“防抖”(debounce)效果。
 * @details
 *              防抖是一种常用的性能优化技术。当一个值在指定的时间延迟内持续快速变化时
 *              （例如，用户在搜索框中快速输入文字），这个 Hook 不会立即返回每一个变化
 *              的值，而是会等待用户停止变化一段时间（由 `delay` 参数指定）后，才返
 *              回最后一次更新的值。
 * 
 * @purpose     主要用于减少在频繁用户输入下触发高成本操作（如API请求、复杂计算）的次数，
 *              从而提升应用性能和用户体验。
 * 
 * @usage       在项目中，此 Hook 被用于：
 *              - `frontend/src/components/AddressFormModal.tsx`:
 *                当用户在地址输入框中输入地址时，使用 `useDebounce` 来延迟更新地址
 *                状态。这样可以避免在用户每输入一个字符时都去触发地址解析或验证的
 *                API 调用，而是在用户停止输入500毫秒后才执行。
 * =====================================================================================
 */

import { useState, useEffect } from 'react'; // 导入 React 的核心 Hooks: useState 用于管理状态，useEffect 用于处理副作用。

/**
 * @function    useDebounce
 * @description 一个自定义 Hook，接收一个泛型值和延迟时间，并返回该值的防抖版本。
 * @template    T - 这是一个泛型参数，表示 `value` 可以是任何类型（如 string, number, object 等）。
 * @param       {T} value - 需要进行防抖处理的原始值。
 * @param       {number} delay - 防抖的延迟时间，以毫秒（ms）为单位。
 * @returns     {T} - 返回经过防抖处理后的值。在 `delay` 时间内，如果 `value` 没有再次改变，则返回最新的 `value`。
 */
export function useDebounce<T>(value: T, delay: number): T {
  // 1. 创建一个内部 state，用于存储和返回最终的防抖值。
  //    它的初始值是传入的 `value`。
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  // 2. 使用 useEffect Hook 来处理防抖的核心逻辑。
  //    这个 effect 会在 `value` 或 `delay` 发生变化时重新执行。
  useEffect(
    () => {
      // 3. 设置一个定时器 (timer)。
      //    这个定时器的作用是：在经过 `delay` 毫秒后，将最新的 `value` 更新到我们的 `debouncedValue` state 中。
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // 4. 返回一个清理函数 (cleanup function)。
      //    这是 useEffect 的关键部分。这个函数会在下一次 effect 重新执行之前，或者在组件被卸载时被调用。
      //    它的作用是清除上一次设置的定时器。
      //
      //    工作流程示例：
      //    - 用户输入 'a'，设置一个500ms后更新的定时器A。
      //    - 用户在100ms后输入 'b'，`value` 变为 'ab'。
      //    - effect 重新执行，首先调用清理函数，清除定时器A。
      //    - 然后设置一个新的500ms后更新的定时器B。
      //    - 这样，只有当用户停止输入超过500ms，最后的那个定时器才会成功触发，从而实现防抖。
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // 依赖项数组：告诉 React 只有当 `value` 或 `delay` 改变时，才需要重新运行此 effect。
  );

  // 5. 返回最终的防抖值。
  //    组件将使用这个 `debouncedValue` 进行渲染或执行操作，而不是原始的、频繁变化的 `value`。
  return debouncedValue;
}