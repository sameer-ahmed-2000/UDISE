'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDistribution } from '@/lib/hooks/useSchools';
import { Filter } from '@/types';
import { useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

interface ChartDataItem {
    label: string;
    count: number;
    percentage?: string;
}

interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        payload: ChartDataItem;
    }>;
}

const COLORS = {
    management: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384', '#36A2EB', '#9966FF'],
    location: ['#8884D8', '#82CA9D'],
    schoolType: ['#FFC658', '#8DD1E1', '#D084D0'],
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartDataItem }> }) => {
    if (active && payload?.length) {
        const item = payload[0].payload;
        return (
            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
                <p className="font-medium">{`${item.label}: ${item.count} (${item.percentage}%)`}</p>
            </div>
        );
    }
    return null;
};

interface ChartWithSelectorProps {
    title: string;
    data: ChartDataItem[];
    colors: string[];
}

function ChartWithSelector({ title, data, colors }: ChartWithSelectorProps) {
    const [chartType, setChartType] = useState<'pie' | 'donut' | 'bar'>('pie');

    const total = data.reduce((acc, item) => acc + item.count, 0);

    const chartData = data.map(item => ({
        ...item,
        percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : '0',
    }));

    const renderChart = () => {
        if (!chartData || chartData.length === 0) return <p>No data available</p>;

        if (chartType === 'bar') {
            return (
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="label"
                            interval={0}
                            angle={-30}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count">
                            {chartData.map((_, i) => (
                                <Cell key={i} fill={colors[i % colors.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            );
        }

        return (
            <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={chartType === 'donut' ? 50 : 0}
                        outerRadius={80}
                        dataKey="count"
                        nameKey="label"
                        label={false}
                    >
                        {chartData.map((_, i) => (
                            <Cell key={i} fill={colors[i % colors.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        content={({ active, payload }: TooltipProps) => {
                            if (active && payload?.length) {
                                const item = payload[0].payload;
                                return (
                                    <div className="bg-white p-2 border border-gray-200 rounded shadow">
                                        <p className="font-medium">
                                            {`${item.label}: ${item.count} (${item.percentage}%)`}
                                        </p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Legend
                        formatter={(value, entry, index) => {
                            const item = chartData.find(d => d.label === value);
                            if (!item) return value;

                            return `${value} (${item.percentage}%)`;
                        }}
                    />

                </PieChart>
            </ResponsiveContainer>
        );
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">{title}</CardTitle>
                <Select onValueChange={(val: 'pie' | 'donut' | 'bar') => setChartType(val)} defaultValue="pie">
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                        <SelectValue placeholder="Chart Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pie">Pie</SelectItem>
                        <SelectItem value="donut">Donut</SelectItem>
                        <SelectItem value="bar">Bar</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>{renderChart()}</CardContent>
        </Card>
    );
}

interface DistributionChartsProps {
    filters?: Filter;
}

export default function DistributionCharts({ filters }: DistributionChartsProps) {
    const { data, isLoading } = useDistribution(filters);

    if (isLoading) return <p>Loading charts...</p>;

    // Transform the distribution data to match the chart format
    const managementTypeData: ChartDataItem[] = data?.management_type
        ? Object.entries(data.management_type).map(([label, count]) => ({ label, count }))
        : [];

    const locationData: ChartDataItem[] = data?.location
        ? Object.entries(data.location).map(([label, count]) => ({ label, count }))
        : [];

    const schoolTypeData: ChartDataItem[] = data?.school_type
        ? Object.entries(data.school_type).map(([label, count]) => ({ label, count }))
        : [];

    return (
        <div className="space-y-6">
            <ChartWithSelector
                title="Management Type Distribution"
                data={managementTypeData}
                colors={COLORS.management}
            />
            <ChartWithSelector
                title="Location Distribution"
                data={locationData}
                colors={COLORS.location}
            />
            <ChartWithSelector
                title="School Type Distribution"
                data={schoolTypeData}
                colors={COLORS.schoolType}
            />
        </div>
    );
}