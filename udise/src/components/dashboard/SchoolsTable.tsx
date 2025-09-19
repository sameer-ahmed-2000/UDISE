'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useFilters } from '@/lib/hooks/useFilters';
import { useSchools } from '@/lib/hooks/useSchools';
import { School } from '@/types';
import { Edit, Eye, Loader2, MoreHorizontal, Trash2 } from 'lucide-react';

interface SchoolsTableProps {
    onView: (school: School) => void;
    onEdit: (school: School) => void;
    onDelete: (school: School) => void;
}

export default function SchoolsTable({ onView, onEdit, onDelete }: SchoolsTableProps) {
    const { filters, updateFilter } = useFilters();
    const { data, isLoading, error } = useSchools(filters);

    const getStatusVariant = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
            Active: 'default',
            Closed: 'destructive',
            Merged: 'secondary',
        };
        return variants[status] || 'default';
    };

    const getLocationVariant = (location: string) => {
        return location === 'Urban' ? 'outline' : 'secondary';
    };

    const handlePageChange = (page: number) => {
        updateFilter('page', page);
    };

    if (error) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <p className="text-sm text-muted-foreground">Error loading schools data</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Schools List</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Loading schools...</span>
                    </div>
                ) : (
                    <>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>UDISE Code</TableHead>
                                        <TableHead>School Name</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>District</TableHead>
                                        <TableHead>Management</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data?.data.map((school) => (
                                        <TableRow key={school._id || school.id}>
                                            <TableCell className="font-mono text-sm">
                                                {school.udise_code}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {school.school_name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getLocationVariant(school.location)}>
                                                    {school.location}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{school.district}</TableCell>
                                            <TableCell>{school.management_type}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(school.school_status)}>
                                                    {school.school_status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => onView(school)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => onEdit(school)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => onDelete(school)}
                                                            className="text-destructive"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {data && data.totalPages > 1 && (
                            <div className="flex items-center justify-center space-x-2 py-4">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => handlePageChange(Math.max(1, (data.page || 1) - 1))}
                                                className={data.page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                            />
                                        </PaginationItem>

                                        {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                                            const pageNum = i + 1;
                                            return (
                                                <PaginationItem key={pageNum}>
                                                    <PaginationLink
                                                        onClick={() => handlePageChange(pageNum)}
                                                        isActive={pageNum === data.page}
                                                        className="cursor-pointer"
                                                    >
                                                        {pageNum}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            );
                                        })}

                                        {data.totalPages > 5 && (
                                            <PaginationItem>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        )}

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => handlePageChange(Math.min(data.totalPages, (data.page || 1) + 1))}
                                                className={data.page === data.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}

                        <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
                            <span>
                                Showing {((data?.page || 1) - 1) * (filters.limit || 10) + 1} to{' '}
                                {Math.min((data?.page || 1) * (filters.limit || 10), data?.total || 0)} of{' '}
                                {data?.total || 0} results
                            </span>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
