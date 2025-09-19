import { schoolsApi } from '@/lib/api/schools';
import { Filter, School } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useSchools = (filters: Filter) => {
    return useQuery({
        queryKey: ['schools', filters],
        queryFn: () => schoolsApi.getSchools(filters),
        staleTime: 5000,
    });
};

export const useCreateSchool = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: schoolsApi.createSchool,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schools'] });
            queryClient.invalidateQueries({ queryKey: ['distribution'] });
            toast.success('School created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create school');
        },
    });
};

export const useUpdateSchool = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<School> }) =>
            schoolsApi.updateSchool(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schools'] });
            queryClient.invalidateQueries({ queryKey: ['distribution'] });
            toast.success('School updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update school');
        },
    });
};

export const useDeleteSchool = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: schoolsApi.deleteSchool,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schools'] });
            queryClient.invalidateQueries({ queryKey: ['distribution'] });
            toast.success('School deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete school');
        },
    });
};
