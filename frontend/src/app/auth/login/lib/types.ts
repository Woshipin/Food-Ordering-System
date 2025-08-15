/**
 * =====================================================================================
 * @file        types.ts
 * @brief       定义登录页面所需的所有 TypeScript 类型。
 * @details
 *              将类型定义与组件逻辑分离，可以使代码更清晰、更易于维护。
 * =====================================================================================
 */

// 定义登录表单的数据结构类型
export interface LoginFormState {
    email: string;
    password: string;
    rememberMe: boolean;
}

// 定义后端返回的验证错误的数据结构类型
// 例如: { email: ["The email field is required."], password: ["The password field is required."] }
export interface LoginValidationErrors {
    [key: string]: string[];
}