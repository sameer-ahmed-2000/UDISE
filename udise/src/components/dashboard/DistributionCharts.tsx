'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDistribution } from '@/lib/hooks/useDistribution';
import { useFilters } from '@/lib/hooks/useFilters';
import { Loader2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const COLORS = {
    management: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'],
    location: ['#8884D8', '#82CA9D'],
    schoolType: ['#FFC658', '#8DD1E1', '#D084D0'],
};

export default function DistributionCharts() {
    const { filters } = useFilters();
    const { data, isLoading, error } = useDistribution(filters);

    if (isLoading) {
        return (
            <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardContent className="flex items-center justify-center py-8">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span>Loading chart...</span>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardContent className="flex items-center justify-center py-8">
                            <p className="text-sm text-muted-foreground">Error loading chart data</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const managementData = Object.entries(data.management_type || {}).map(([key, value]) => ({
        name: key,
        value,
    }));

    const locationData = Object.entries(data.location || {}).map(([key, value]) => ({
        name: key,
        value,
    }));

    const schoolTypeData = Object.entries(data.school_type || {}).map(([key, value]) => ({
        name: key,
        value,
    }));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
                    <p className="font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {/* Management Type Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Management Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={managementData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {managementData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS.management[index % COLORS.management.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Location Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Location Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={locationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" fill="#8884d8">
                                {locationData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS.location[index % COLORS.location.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* School Type Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">School Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={schoolTypeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" fill="#82ca9d">
                                {schoolTypeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS.schoolType[index % COLORS.schoolType.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Summary Stats */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Schools:</span>
                            <span className="font-medium">
                                {Object.values(data.management_type || {}).reduce((a: number, b: number) => a + b, 0)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Government Schools:</span>
                            <span className="font-medium">
                                {data.management_type?.Government || 0}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Private Schools:</span>
                            <span className="font-medium">
                                {data.management_type?.Private || 0}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Urban Schools:</span>
                            <span className="font-medium">
                                {data.location?.Urban || 0}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Rural Schools:</span>
                            <span className="font-medium">
                                {data.location?.Rural || 0}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
