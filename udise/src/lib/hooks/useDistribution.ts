import { schoolsApi } from '@/lib/api/schools';
import { DistributionData, Filter } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const useDistribution = (filters: Filter) => {
    return useQuery<DistributionData>({
        queryKey: ['distribution', filters],
        queryFn: () => schoolsApi.getDistribution(filters),
        staleTime: 5000,
    });
};
