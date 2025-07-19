// 定义 User 对象的类型结构
// 这应该和你 Laravel 后端返回的用户信息字段一致
export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
    created_at: string;
    updated_at: string;
}