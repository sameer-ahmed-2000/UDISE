import { DistributionData, Filter, PaginationResponse, School } from '@/types';
import apiClient from './client';

export const schoolsApi = {
    getSchools: async (filters: Filter): Promise<PaginationResponse<School>> => {
        const { data } = await apiClient.get<PaginationResponse<School>>('/api/data', { params: filters });
        return data;
    },

    getSchool: async (id: string): Promise<School> => {
        const { data } = await apiClient.get<School>(`/api/data/${id}`);
        return data;
    },

    createSchool: async (school: Omit<School, '_id' | 'id'>): Promise<School> => {
        const { data } = await apiClient.post<School>('/api/data', school);
        return data;
    },

    updateSchool: async (id: string, school: Partial<School>): Promise<School> => {
        const { data } = await apiClient.put<School>(`/api/data/${id}`, school);
        return data;
    },

    deleteSchool: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/data/${id}`);
    },

    getDistribution: async (filters: Filter): Promise<DistributionData> => {
        const { data } = await apiClient.get<DistributionData>('/api/data/distribution', { params: filters });
        return data;
    },
};
