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
import { Filter } from '@/types';
import axios from 'axios';
import Cookies from 'js-cookie';
import { RotateCcw } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

interface FilterBarProps {
    filters: Filter;
    setFilters: Dispatch<SetStateAction<Filter>>;
}

export default function FilterBar({ filters, setFilters }: FilterBarProps) {
    const [states, setStates] = useState<string[]>([]);
    const [districts, setDistricts] = useState<string[]>([]);
    const [blocks, setBlocks] = useState<string[]>([]);
    const [villages, setVillages] = useState<string[]>([]);
    const token = Cookies.get('token');

    const fetchData = async (level: string, parent?: Record<string, string>) => {
        try {
            const params: Record<string, string> = {};
            if (parent) Object.assign(params, parent);

            const res = await axios.get<{ data: string[] }>(`${process.env.NEXT_PUBLIC_API_URL}/api/data/filter`, {
                headers: { Authorization: `Bearer ${token}` },
                params,
            });

            const data = res.data.data;

            switch (level) {
                case 'state':
                    setStates(data);
                    break;
                case 'district':
                    setDistricts(data);
                    break;
                case 'block':
                    setBlocks(data);
                    break;
                case 'village':
                    setVillages(data);
                    break;
            }
        } catch (err) {
            console.error(`Failed to fetch ${level}:`, err);
        }
    };

    // Load states initially
    useEffect(() => {
        fetchData('state');
    }, []);

    // Load districts when state changes
    useEffect(() => {
        if (filters.state) {
            fetchData('district', { state: filters.state });
            setFilters(prev => ({ ...prev, district: '', block: '', village: '' }));
            setBlocks([]);
            setVillages([]);
        } else {
            setDistricts([]);
            setBlocks([]);
            setVillages([]);
        }
    }, [filters.state, setFilters]);

    // Load blocks when district changes
    useEffect(() => {
        if (filters.district && filters.state) {
            fetchData('block', { state: filters.state, district: filters.district });
            setFilters(prev => ({ ...prev, block: '', village: '' }));
            setVillages([]);
        } else {
            setBlocks([]);
            setVillages([]);
        }
    }, [filters.district, filters.state, setFilters]);

    // Load villages when block changes
    useEffect(() => {
        if (filters.block && filters.district && filters.state) {
            fetchData('village', {
                state: filters.state,
                district: filters.district,
                block: filters.block,
            });
            setFilters(prev => ({ ...prev, village: '' }));
        } else {
            setVillages([]);
        }
    }, [filters.block, filters.district, filters.state, setFilters]);

    const handleChange = (key: 'state' | 'district' | 'block' | 'village', value: string) => {
        setFilters(prev => ({ ...prev, [key]: value === 'all' ? '' : value }));
    };

    const handleReset = () => setFilters({});

    return (
        <Card className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
                {/* State */}
                <Select value={filters.state || 'all'} onValueChange={(v) => handleChange('state', v)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All States</SelectItem>
                        {states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>

                {/* District */}
                <Select value={filters.district || 'all'} onValueChange={(v) => handleChange('district', v)} disabled={!filters.state}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select District" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Districts</SelectItem>
                        {districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                </Select>

                {/* Block */}
                <Select value={filters.block || 'all'} onValueChange={(v) => handleChange('block', v)} disabled={!filters.district}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select Block" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Blocks</SelectItem>
                        {blocks.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                </Select>

                {/* Village */}
                <Select value={filters.village || 'all'} onValueChange={(v) => handleChange('village', v)} disabled={!filters.block}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select Village" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Villages</SelectItem>
                        {villages.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Button onClick={handleReset} variant="outline" size="icon">
                    <RotateCcw className="h-4 w-4" />
                </Button>
            </div>
        </Card>
    );
}