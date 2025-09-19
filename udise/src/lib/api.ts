import axios from 'axios';
import Cookies from 'js-cookie';
import { School } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '<http://localhost:5000>';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
    const token = Cookies.get('auth-token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            Cookies.remove('auth-token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (email: string, password: string) =>
        api.post('/api/auth/login', { email, password }),
    signup: (name: string, email: string, password: string) =>
        api.post('/api/auth/signup', { name, email, password }),
};

export const schoolsAPI = {
    getSchools: (params: any) => api.get('/api/data', { params }),
    addSchool: (school: Partial<School>) => api.post('/api/data', school),
    updateSchool: (id: string, school: Partial<School>) =>
        api.put(`/api/data/${id}`, school),
    deleteSchool: (id: string) => api.delete(`/api/data/${id}`),
    getDistribution: (params: any) =>
        api.get('/api/data/distribution', { params }),
};

export const filtersAPI = {
    getFilterOptions: (params: any) => api.get('/api/data/filter', { params }),
};

export default api;
