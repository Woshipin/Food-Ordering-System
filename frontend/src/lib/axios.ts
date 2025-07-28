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

// Response interceptor to handle global errors like 401
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Check if we are on the client side
            if (typeof window !== 'undefined') {
                console.log("Unauthorized, logging out...");
                // Clear user data from storage
                localStorage.removeItem('user');
                localStorage.removeItem('auth_token');
                // Redirect to login page
                window.location.href = '/auth/login';
            }
        }
        return Promise.reject(error);
    }
);

export const post = axios.post;
export default axios;