'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useFilters } from '@/lib/hooks/useFilters';
import { RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

// Mock data for states/districts/blocks/villages
const locationData: {
    states: string[];
    districts: Record<string, string[]>;
    blocks: Record<string, string[]>;
    villages: Record<string, string[]>;
} = {
    states: ['Madhya Pradesh', 'Maharashtra', 'Uttar Pradesh', 'Rajasthan'],
    districts: {
        'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior'],
        'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
        'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi'],
        'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'],
    },
    blocks: {
        'Bhopal': ['Block1', 'Block2', 'Block3'],
        'Indore': ['Block1', 'Block2', 'Block3'],
        'Mumbai': ['Block1', 'Block2', 'Block3'],
        'Pune': ['Block1', 'Block2', 'Block3'],
    },
    villages: {
        'Block1': ['Village1', 'Village2', 'Village3'],
        'Block2': ['Village4', 'Village5', 'Village6'],
        'Block3': ['Village7', 'Village8', 'Village9'],
    },
};

export default function FilterBar() {
    const { filters, updateFilter, clearFilters } = useFilters();
    const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
    const [availableBlocks, setAvailableBlocks] = useState<string[]>([]);
    const [availableVillages, setAvailableVillages] = useState<string[]>([]);

    useEffect(() => {
        if (filters.state) {
            setAvailableDistricts(locationData.districts[filters.state] || []);
        } else {
            setAvailableDistricts([]);
        }
    }, [filters.state]);

    useEffect(() => {
        if (filters.district) {
            setAvailableBlocks(locationData.blocks[filters.district] || []);
        } else {
            setAvailableBlocks([]);
        }
    }, [filters.district]);

    useEffect(() => {
        if (filters.block) {
            setAvailableVillages(locationData.villages[filters.block] || []);
        } else {
            setAvailableVillages([]);
        }
    }, [filters.block]);

    const handleStateChange = (value: string) => {
        updateFilter('state', value === 'all' ? '' : value);
    };

    const handleDistrictChange = (value: string) => {
        updateFilter('district', value === 'all' ? '' : value);
    };

    const handleBlockChange = (value: string) => {
        updateFilter('block', value === 'all' ? '' : value);
    };

    const handleVillageChange = (value: string) => {
        updateFilter('village', value === 'all' ? '' : value);
    };

    const handleReset = () => {
        clearFilters();
    };

    return (
        <Card className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
                <Select value={filters.state || 'all'} onValueChange={handleStateChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All States</SelectItem>
                        {locationData.states.map((state) => (
                            <SelectItem key={state} value={state}>
                                {state}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.district || 'all'}
                    onValueChange={handleDistrictChange}
                    disabled={!filters.state}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Districts</SelectItem>
                        {availableDistricts.map((district) => (
                            <SelectItem key={district} value={district}>
                                {district}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.block || 'all'}
                    onValueChange={handleBlockChange}
                    disabled={!filters.district}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Block" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Blocks</SelectItem>
                        {availableBlocks.map((block) => (
                            <SelectItem key={block} value={block}>
                                {block}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.village || 'all'}
                    onValueChange={handleVillageChange}
                    disabled={!filters.block}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Village" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Villages</SelectItem>
                        {availableVillages.map((village) => (
                            <SelectItem key={village} value={village}>
                                {village}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button onClick={handleReset} variant="outline" size="icon">
                    <RotateCcw className="h-4 w-4" />
                </Button>
            </div>
        </Card>
    );
}