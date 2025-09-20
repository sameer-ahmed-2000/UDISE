import axios from 'axios';
import Cookies from 'js-cookie';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = Cookies.get('token');

        if (!config.headers) {
            config.headers = {};
        }

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        config.headers['X-Custom-Header'] = 'CustomValue';

        return config;
    },
    (error) => Promise.reject(error)
);

export default apiClient;
