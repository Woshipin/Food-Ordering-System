"use client"; // 声明这是一个客户端组件，可以在浏览器环境中运行

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'; // 导入 React 相关的钩子和类型

import { User } from '@/types'; // 导入用户类型定义

// 定义认证上下文(AuthContext)中提供的数据和方法的类型
interface AuthContextType {
    user: User | null; // 当前登录的用户信息，如果未登录则为 null
    setUser: React.Dispatch<React.SetStateAction<User | null>>; // 更新用户状态的函数
    login: (userData: User, token: string) => void; // 用户登录函数
    logout: () => void; // 用户登出函数
    isAuthenticated: boolean; // 布尔值，表示用户是否已认证
    isLoading: boolean; // 布尔值，表示认证状态是否正在加载中
}

// 创建一个 React 上下文(Context)，用于在整个应用中共享认证状态
// 初始值为 undefined，因为在 Provider 外部访问是没有意义的
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 定义 AuthProvider 组件，它将作为认证状态的提供者
// 它接收 children 作为参数，这些子组件将能够访问此上下文
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // 使用 useState 创建一个状态来存储用户信息，初始值为 null
    const [user, setUser] = useState<User | null>(null);
    // 使用 useState 创建一个加载状态，初始值为 true，表示开始时需要检查认证状态
    const [isLoading, setIsLoading] = useState(true);

    // 使用 useEffect 在组件首次加载时执行副作用操作
    useEffect(() => {
        try {
            // 从浏览器的 localStorage 中获取存储的用户信息和认证令牌
            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('auth_token');
            
            // 如果同时存在用户信息和令牌，说明用户之前登录过
            if (storedUser && token) {
                // 将存储的 JSON 字符串解析为用户对象，并更新用户状态
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            // 如果解析过程中发生错误（例如 localStorage 中的数据格式不正确）
            console.error("从 localStorage 解析用户数据失败", error);
            // 将用户状态设为 null
            setUser(null);
        } finally {
            // 无论成功与否，最后都将加载状态设置为 false
            setIsLoading(false);
        }
    }, []); // 空依赖数组 [] 表示此 effect 只在组件挂载时运行一次

    // 定义登录函数
    const login = (userData: User, token: string) => {
        // 将用户信息和认证令牌存储到 localStorage 中
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('auth_token', token);
        // 更新应用内的用户状态
        setUser(userData);
    };

    // 定义登出函数
    const logout = () => {
        // 从 localStorage 中移除用户信息和认证令牌
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
        // 将应用内的用户状态重置为 null
        setUser(null);
    };

    // 返回 AuthContext.Provider 组件，它会将 value 中定义的值提供给所有子组件
    return (
        <AuthContext.Provider value={{ 
            user, // 当前用户
            setUser, // 更新用户的函数
            login, // 登录函数
            logout, // 登出函数
            isAuthenticated: !!user, // 通过 !!user 将 user 对象转换为布尔值，判断是否认证
            isLoading // 加载状态
        }}>
            {/* 
              在加载状态(isLoading)为 true 时，不渲染任何子组件 (返回 null)
              这样可以防止在从 localStorage 恢复认证状态期间，页面显示错误的状态（例如，短暂显示“请登录”）
              只有当加载完成后，才渲染 children
            */}
            {isLoading ? null : children}
        </AuthContext.Provider>
    );
};

// 创建一个自定义钩子(custom hook) useAuth，简化对 AuthContext 的使用
export const useAuth = () => {
    // 使用 useContext 钩子获取当前上下文的值
    const context = useContext(AuthContext);
    // 如果上下文为 undefined，说明 useAuth 没有在 AuthProvider 内部使用
    if (context === undefined) {
        // 抛出一个错误，提醒开发者正确使用
        throw new Error('useAuth 必须在 AuthProvider 内部使用');
    }
    // 返回上下文的值，方便组件直接调用
    return context;
};