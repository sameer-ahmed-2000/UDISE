import { schoolsApi } from '@/lib/api/schools';
import { Filter, School } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// 🔹 Fetch schools with filters
export const useSchools = (page: number = 1, pageSize: number = 10, filters: Filter = {}) => {
    const query = useQuery({
        queryKey: ['schools', page, pageSize, filters],
        queryFn: () => schoolsApi.getSchools({ ...filters, page, limit: pageSize }),
        staleTime: 5000,
    });

    return { ...query, refetch: query.refetch }; // expose refetch
};


// Common context type for optimistic updates
type MutationContext = { prevData?: any };

// 🔹 Create school (all fields except ids required)
export const useCreateSchool = () => {
    const queryClient = useQueryClient();

    return useMutation<School, Error, Omit<School, '_id' | 'id'>, MutationContext>({
        mutationFn: (school) => schoolsApi.createSchool(school),
        onMutate: async (newSchool) => {
            await queryClient.cancelQueries({ queryKey: ['schools'] });

            const prevData = queryClient.getQueryData<any>(['schools']);

            queryClient.setQueryData<any>(['schools'], (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    data: [{ ...newSchool, _id: 'temp-id' }, ...old.data],
                    total: old.total + 1,
                };
            });

            return { prevData };
        },
        onError: (err, _, context) => {
            if (context?.prevData) {
                queryClient.setQueryData(['schools'], context.prevData);
            }
            toast.error((err as any).response?.data?.message || 'Failed to create school');
        },
        onSuccess: () => {
            // Invalidate all schools queries regardless of filters/pagination
            queryClient.invalidateQueries({ 
                queryKey: ['schools'],
                exact: false 
            });
            // Also invalidate distribution data
            queryClient.invalidateQueries({ 
                queryKey: ['distribution'],
                exact: false 
            });
            toast.success('School created successfully');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['schools'] });
        },
    });
};

// 🔹 Update school (partial payload allowed)
export const useUpdateSchool = () => {
    const queryClient = useQueryClient();

    return useMutation<School, Error, { id: string; data: Partial<School> }, MutationContext>({
        mutationFn: ({ id, data }) => schoolsApi.updateSchool(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: ['schools'] });

            const prevData = queryClient.getQueryData<any>(['schools']);

            queryClient.setQueryData<any>(['schools'], (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    data: old.data.map((s: School) =>
                        s._id === id || s.id === id ? { ...s, ...data } : s
                    ),
                };
            });

            return { prevData };
        },
        onError: (err, _, context) => {
            if (context?.prevData) {
                queryClient.setQueryData(['schools'], context.prevData);
            }
            toast.error((err as any).response?.data?.message || 'Failed to update school');
        },
        onSuccess: () => {
            // Invalidate all schools queries regardless of filters/pagination  
            queryClient.invalidateQueries({ 
                queryKey: ['schools'],
                exact: false 
            });
            // Also invalidate distribution data
            queryClient.invalidateQueries({ 
                queryKey: ['distribution'],
                exact: false 
            });
            toast.success('School updated successfully');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['schools'] });
        },
    });
};

// 🔹 Delete school (optimistic update + rollback)
export const useDeleteSchool = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, string, MutationContext>({
        mutationFn: (id) => schoolsApi.deleteSchool(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['schools'] });

            const prevData = queryClient.getQueryData<any>(['schools']);

            queryClient.setQueryData<any>(['schools'], (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    data: old.data.filter((s: School) => s._id !== id && s.id !== id),
                    total: old.total - 1,
                };
            });

            return { prevData };
        },
        onError: (err, _, context) => {
            if (context?.prevData) {
                queryClient.setQueryData(['schools'], context.prevData);
            }
            toast.error((err as any).response?.data?.message || 'Failed to delete school');
        },
        onSuccess: () => {
            // Invalidate all schools queries regardless of filters/pagination
            queryClient.invalidateQueries({ 
                queryKey: ['schools'], 
                exact: false 
            });
            // Also invalidate distribution data
            queryClient.invalidateQueries({ 
                queryKey: ['distribution'], 
                exact: false 
            });
            toast.success('School deleted successfully');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['schools'], exact: false });
        },
    });
};
export const useDistribution = (filters?: Filter) => {
    return useQuery({
        queryKey: ['distribution', filters],
        queryFn: async () => {
            console.log('Fetching distribution with filters:', filters);
            return schoolsApi.getDistribution(filters || {}); // fetch all if undefined
        },
        placeholderData: (previousData) => previousData,
        staleTime: 5000,
    });
};