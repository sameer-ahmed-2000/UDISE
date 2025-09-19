export interface School {
    _id?: string;
    id?: string;
    udise_code: string;
    school_name: string;
    state: string;
    district: string;
    block: string;
    village: string;
    location: 'Urban' | 'Rural';
    management_type: 'Government' | 'Private' | 'Aided';
    school_category: 'Primary' | 'Secondary' | 'Higher Secondary';
    school_type: 'Boys' | 'Girls' | 'Co-Ed';
    school_status: 'Active' | 'Closed' | 'Merged';
    createdAt?: string;
    updatedAt?: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface Filter {
    state?: string;
    district?: string;
    block?: string;
    village?: string;
    page?: number;
    limit?: number;
}

export interface DistributionData {
    management_type: Record<string, number>;
    location: Record<string, number>;
    school_type: Record<string, number>;
}

export interface PaginationResponse<T> {
    data: T[];
    total: number;
    page: number;
    totalPages: number;
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

export interface FilterOptions {
    states: string[];
    districts: string[];
    blocks: string[];
    villages: string[];
}
