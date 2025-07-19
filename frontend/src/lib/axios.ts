import Axios from 'axios';

const axios = Axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
});

// Request interceptor to add the token to headers
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Function to get CSRF cookie
export const getCsrfCookie = async () => {
    try {
        // Use the base URL for the CSRF cookie request
        await Axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/sanctum/csrf-cookie`, {
            withCredentials: true,
        });
    } catch (error) {
        console.error('Error fetching CSRF cookie:', error);
    }
};

// Wrapper for POST requests that handles CSRF
export const post = async (url: string, data: any) => {
    await getCsrfCookie();
    return axios.post(url, data);
};

export default axios;