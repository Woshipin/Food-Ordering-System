/**
 * =====================================================================================
 * @file        types.ts
 * @brief       定义注册页面所需的所有 TypeScript 类型。
 * @details
 *              将类型定义与组件逻辑分离，可以使代码更清晰、更易于维护。
 * =====================================================================================
 */

// 定义注册表单的数据结构类型
export interface RegisterFormState {
    name: string;
    email: string;
    phone_number: string;
    user_image: string; // 通常在提交时处理文件对象，这里可以是文件名或空字符串
    password: string;
    password_confirmation: string;
    agreeToTerms: boolean;
}

// 定义后端返回的验证错误的数据结构类型
export interface RegisterValidationErrors {
    name?: string[];
    email?: string[];
    phone_number?: string[];
    user_image?: string[];
    password?: string[];
    password_confirmation?: string[];
    agreeToTerms?: string[];
    [key: string]: string[] | undefined; // 允许其他可能的错误字段
}