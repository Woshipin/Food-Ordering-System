/**
 * =====================================================================================
 * @file        axios.ts
 * @brief       全局 Axios 实例配置文件。
 * @details
 *              这个文件创建并配置了一个全局的 Axios 实例，用于应用中所有的 HTTP
 *              请求。它通过设置基础 URL 和拦截器 (interceptors)，统一了 API 请求
 *              的行为。
 * 
 * @purpose     1.  **统一配置**: 提供一个中心化的位置来设置所有 API 请求的公共参数，
 *                  如基础 URL (`baseURL`)。
 *              2.  **自动附加认证令牌**: 使用请求拦截器 (request interceptor) 在每
 *                  个发出的请求头中自动附加 JWT 认证令牌。这避免了在每个 API 调用
 *                  中手动添加 `Authorization` 头的重复工作。
 *              3.  **全局错误处理**: 使用响应拦截器 (response interceptor) 来捕获
 *                  全局的 HTTP 错误，特别是 `401 Unauthorized` 错误。当令牌失效
 *                  时，它可以自动执行登出操作并重定向到登录页面。
 * 
 * @usage       在任何需要发送 HTTP 请求的文件中，直接导入此文件即可。
 *              `import axios from '@/lib/axios';`
 *              然后就可以使用 `axios.get('/some-endpoint')` 或 `axios.post(...)`
 *              等方法发起请求。
 * =====================================================================================
 */

import Axios, { InternalAxiosRequestConfig } from 'axios'; // 导入 Axios 库和其类型定义。

// 1. 创建一个 Axios 实例。
//    通过创建实例，我们可以拥有一个独立的、具有特定配置的请求客户端，而不会影响全局的 Axios 对象。
const axios = Axios.create({
    // 2. 设置基础 URL。
    //    所有使用此实例发出的相对路径请求，都会自动在前面拼接上这个 URL。
    //    `process.env.NEXT_PUBLIC_BACKEND_URL` 从环境变量中读取后端的基础地址。
    baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`,
    // 3. 设置默认请求头。
    //    `'X-Requested-With': 'XMLHttpRequest'` 是一个常见的请求头，
    //    它可以帮助一些后端框架（如 Laravel）识别出这是一个 AJAX (异步) 请求。
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    },
});

// 4. 设置请求拦截器 (Request Interceptor)。
//    拦截器会在每个请求被发送出去之前执行。
axios.interceptors.request.use(
    // (config) => { ... } 是一个成功处理函数，它接收请求的配置对象作为参数。
    (config: InternalAxiosRequestConfig) => {
        // 检查当前是否在浏览器环境中 (因为服务器端渲染时 `localStorage` 不存在)。
        if (typeof window !== 'undefined') {
            // 从 localStorage 中获取已保存的认证令牌。
            const token = localStorage.getItem('auth_token');
            // 如果令牌存在...
            if (token) {
                // ...就在当前请求的头中添加 `Authorization` 字段。
                //    格式为 'Bearer [token]'，这是 JWT 的标准用法。
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        // 必须返回修改后的 config 对象，否则请求将不会被发送。
        return config;
    },
    // (error) => { ... } 是一个错误处理函数，如果请求配置过程中出现错误，它将被调用。
    (error: any) => {
        // 将错误继续向下传递。
        return Promise.reject(error);
    }
);

// 5. 设置响应拦截器 (Response Interceptor)。
//    拦截器会在应用接收到服务器响应之后，但在 `.then()` 或 `.catch()` 处理它之前执行。
axios.interceptors.response.use(
    // (response) => response 是一个成功处理函数，对于成功的响应（状态码 2xx），我们直接将其返回。
    (response) => response,
    // (error) => { ... } 是一个错误处理函数，对于失败的响应（状态码非 2xx），它将被调用。
    (error) => {
        // 检查错误响应是否存在，并且状态码是否为 401 (Unauthorized)。
        if (error.response && error.response.status === 401) {
            // 再次检查是否在浏览器环境中。
            if (typeof window !== 'undefined') {
                console.log("响应拦截器检测到 401 未授权，执行登出...");
                // 如果是 401 错误，说明用户的令牌已失效或无权访问。
                // 我们需要强制用户登出，以确保应用状态的正确性。
                localStorage.removeItem('user'); // 清理本地存储的用户信息。
                localStorage.removeItem('auth_token'); // 清理本地存储的无效令牌。
                // 将用户重定向到登录页面。
                window.location.href = '/auth/login';
            }
        }
        // 对于其他错误，或者在非浏览器环境中，将错误继续向下传递，以便在具体的 API 调用处可以捕获和处理。
        return Promise.reject(error);
    }
);

// 6. 导出已配置好的 Axios 实例，作为默认导出。
export default axios;