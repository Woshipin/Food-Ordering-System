/**
 * =====================================================================================
 * @file        AuthContext.tsx
 * @brief       全局认证状态管理中心 (Authentication Context)。
 * @details
 *              这个文件是整个应用认证系统的核心。它使用 React Context API 创建了一个
 *              全局的“认证提供者”(`AuthProvider`)。任何被 `AuthProvider` 包裹的子
 *              组件，都可以通过 `useAuth` 这个自定义 Hook 轻松地访问和操作用户的
 *              认证状态，如用户信息、登录状态、登录和登出函数等。
 * 
 * @purpose     1.  **状态共享**: 在整个应用的组件树中共享一个统一的认证状态，避免了
 *                  通过 props 层层传递的麻烦 (prop drilling)。
 *              2.  **逻辑封装**: 将登录、登出、启动时验证令牌等核心认证逻辑封装在
 *                  一个地方，便于维护和管理。
 *              3.  **持久化**: 将用户的登录状态（令牌和用户信息）保存在浏览器的
 *                  `localStorage` 中，即使用户刷新页面或关闭浏览器再打开，也能
 *                  尝试恢复其登录状态。
 *              4.  **状态同步**: 确保前端的登录状态与后端服务器的真实状态保持同步。
 * 
 * @usage       在 `frontend/src/app/layout.tsx` (或类似的顶层布局文件) 中，
 *              用 `<AuthProvider>` 将整个应用包裹起来。之后，在任何需要认证信息
 *              的子组件中，通过调用 `const { user, isAuthenticated } = useAuth();`
 *              来获取状态或方法。
 * =====================================================================================
 */

"use client"; // 声明这是一个客户端组件，因为它需要使用 React Hooks 和访问浏览器 API (localStorage)。

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'; // 导入 React 核心功能。
import { User } from '@/types'; // 导入用户数据结构类型定义。
import axios from '../lib/axios'; // 导入预先配置好的 axios 实例，用于API请求。

// 1. 定义 `AuthContext` 将提供给子组件的数据和方法的类型结构 (Interface)。
interface AuthContextType {
    user: User | null;                                      // 当前登录的用户对象，如果未登录则为 null。
    setUser: React.Dispatch<React.SetStateAction<User | null>>; // 更新用户状态的函数 (通常不直接使用，而是通过 login/logout)。
    login: (userData: User, token: string) => void;         // 处理用户登录的函数。
    logout: () => Promise<void>;                            // 处理用户登出的异步函数。
    isAuthenticated: boolean;                               // 一个布尔值，方便地判断用户是否已认证。
    isLoading: boolean;                                     // 一个布尔值，表示应用初始加载时，是否正在验证认证状态。
    isLoggingOut: boolean;                                  // 一个布尔值，表示当前是否正在执行登出操作。
}

// 2. 使用 `createContext` 创建一个 React 上下文实例。
//    初始值为 `undefined`，因为在 `AuthProvider` 外部访问此上下文是没有意义的。
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. 定义 `AuthProvider` 组件，它将作为所有认证状态和逻辑的提供者。
//    它接收 `children` 作为 props，代表任何被它包裹的子组件。
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // --- State Definitions ---
    const [user, setUser] = useState<User | null>(null); // 存储当前用户信息的 state。
    const [isLoading, setIsLoading] = useState(true);    // 初始认证状态加载中的 state。
    const [isLoggingOut, setIsLoggingOut] = useState(false); // 登出过程进行中的 state。

    // --- Core Authentication Functions ---

    /**
     * @function login
     * @description 处理用户登录的逻辑。
     * @param {User} userData - 从API获取的用户对象。
     * @param {string} token - 从API获取的认证令牌 (JWT)。
     */
    const login = (userData: User, token: string) => {
        // 将用户信息（转换为JSON字符串）和令牌存储到浏览器的 localStorage 中，以实现持久化。
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('auth_token', token);
        // 更新应用内的用户 state，这将触发所有使用 `useAuth` 的组件重新渲染。
        setUser(userData);
    };

    /**
     * @function logout
     * @description 处理用户登出的异步逻辑。
     */
    const logout = async () => {
        setIsLoggingOut(true); // 开始登出，设置加载状态为 true。
        try {
            // 尝试调用后端的登出接口。这可以让后端有机会将令牌加入黑名单或执行其他清理操作。
            // 即使这个请求失败，我们仍然要继续执行前端的登出流程，以确保用户界面正确。
            await axios.post('/auth/logout');
        } catch (error) {
            console.error("登出时API调用失败 (这通常是正常的，例如令牌已过期)", error);
        } finally {
            // 不论API调用成功与否，都执行以下清理操作：
            localStorage.removeItem('user'); // 从 localStorage 中移除用户信息。
            localStorage.removeItem('auth_token'); // 从 localStorage 中移除认证令牌。
            setUser(null); // 将应用内的用户 state 重置为 null。
            setIsLoggingOut(false); // 结束登出，设置加载状态为 false。
        }
    };

    // 4. 使用 `useEffect` 在组件首次挂载时执行副作用，用于验证用户身份。
    //    这是确保前端状态与后端同步的关键。
    useEffect(() => {
        const verifyAuth = async () => {
            const token = localStorage.getItem('auth_token'); // 从 localStorage 中获取令牌。
            if (token) {
                // 如果令牌存在，我们不能盲目相信它，需要向后端验证其有效性。
                try {
                    // 向受保护的 `/auth/me` 接口发送请求。
                    // axios 拦截器会自动附上 `Authorization: Bearer ${token}` 请求头。
                    const response = await axios.get('/auth/me');
                    // 如果请求成功 (返回 200 OK)，说明令牌有效，后端返回了最新的用户信息。
                    setUser(response.data);
                } catch (error) {
                    // 如果请求失败 (例如，后端返回 401 Unauthorized)，说明令牌已过期或无效。
                    console.error("Token 验证失败，执行登出清理。", error);
                    // 调用 logout 函数来清理本地存储的无效数据。
                    // 注意：这里我们直接调用内部的清理逻辑，而不是完整的 `logout` 函数，以避免不必要的API调用和状态更新。
                    localStorage.removeItem('user');
                    localStorage.removeItem('auth_token');
                    setUser(null);
                }
            }
            // 无论令牌是否存在或是否有效，验证流程结束后，都将初始加载状态设置为 false。
            setIsLoading(false);
        };

        verifyAuth();
    }, []); // 空依赖数组 `[]` 确保此 effect 只在组件首次挂载时运行一次。

    // 5. 返回 `AuthContext.Provider` 组件。
    //    它会将 `value` prop 中定义的所有状态和函数，提供给组件树中所有深度的子组件。
    return (
        <AuthContext.Provider value={{ 
            user, 
            setUser, 
            login, 
            logout, 
            isAuthenticated: !!user, // 使用 `!!` 将 user 对象（或 null）快速转换为布尔值。
            isLoading, 
            isLoggingOut 
        }}>
            {/* 
              这是一个重要的优化：在初始加载（验证令牌）期间，不渲染任何子组件。
              这可以防止页面在加载时出现“闪烁”（例如，短暂地显示“登录”按钮，然后又变为“欢迎您”）。
              只有当 `isLoading` 变为 `false` 后，才渲染真正的应用内容 (`children`)。
            */}
            {isLoading ? null : children}
        </AuthContext.Provider>
    );
};

// 6. 创建一个自定义钩子 `useAuth`，以简化对上下文的访问。
/**
 * @function    useAuth
 * @description 一个便捷的自定义 Hook，用于在组件中访问认证上下文。
 * @returns     {AuthContextType} 返回包含所有认证状态和方法的对象。
 * @throws      如果此 Hook 没有在 `AuthProvider` 内部使用，则会抛出一个错误。
 */
export const useAuth = () => {
    const context = useContext(AuthContext); // 使用 React 的 `useContext` 钩子来获取上下文的值。
    if (context === undefined) {
        // 这是一个保护机制，如果开发者在 `AuthProvider` 外部错误地使用了 `useAuth`，
        // 就会立即得到一个清晰的错误提示，而不是一个难以调试的运行时错误。
        throw new Error('useAuth 必须在 AuthProvider 内部使用');
    }
    return context; // 返回上下文的值。
};