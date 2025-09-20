import { BackendDistributionData, DistributionData, Filter, PaginationResponse, School } from '@/types';
import apiClient from './client';

interface BackendSchoolsResponse {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    schools: School[];
}

export const schoolsApi = {
    getSchools: async (filters: Filter): Promise<PaginationResponse<School>> => {
        const { data } = await apiClient.get<BackendSchoolsResponse>('/api/data', { params: filters });
        
        return {
            data: data.schools || [],
            total: data.total || 0,
            page: data.page || 1,
            totalPages: data.totalPages || 1
        };
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
        console.log('Fetching distribution with filters:', filters)
        const { data } = await apiClient.get<BackendDistributionData>('/api/data/distribution', { params: filters });
        
        return {
            management_type: data.managementTypeDistribution?.reduce((acc, item) => {
                acc[item.label] = item.count;
                return acc;
            }, {} as Record<string, number>) || {},
            location: data.locationDistribution?.reduce((acc, item) => {
                acc[item.label] = item.count;
                return acc;
            }, {} as Record<string, number>) || {},
            school_type: data.schoolTypeDistribution?.reduce((acc, item) => {
                acc[item.label] = item.count;
                return acc;
            }, {} as Record<string, number>) || {}
        };
    },
};