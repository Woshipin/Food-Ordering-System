import Axios, { InternalAxiosRequestConfig } from 'axios';

const axios = Axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    },
});

// Request interceptor to add the token to headers
axios.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: any) => {
        return Promise.reject(error);
    }
);

export const post = axios.post;
export default axios;