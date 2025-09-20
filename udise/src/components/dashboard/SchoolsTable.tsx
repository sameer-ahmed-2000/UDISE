'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Filter, School } from '@/types';
import { ChevronFirst, ChevronLast, Edit, Trash2 } from 'lucide-react';
import { Dispatch, SetStateAction, useState } from 'react';

interface SchoolsTableProps {
    schools?: School[];
    isLoading?: boolean;
    totalCount?: number;
    page?: number;
    pageSize?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    onView: Dispatch<SetStateAction<School | null>>;
    onEdit: Dispatch<SetStateAction<School | null>>;
    onDelete: Dispatch<SetStateAction<School | null>>;
    filters?: Filter;
}

export default function SchoolsTable({ 
    schools = [], 
    isLoading = false, 
    totalCount = 0,
    page = 1,
    pageSize = 5,
    onPageChange,
    onPageSizeChange,
    onView, 
    onEdit, 
    onDelete 
}: SchoolsTableProps) {
    const [localPage, setLocalPage] = useState(page);
    const [localLimit, setLocalLimit] = useState(pageSize);

    const pageSizeOptions = [5, 10, 25, 50, 100];
    
    const currentPage = onPageChange ? page : localPage;
    const currentLimit = onPageSizeChange ? pageSize : localLimit;
    
    const shouldPaginate = !onPageChange;
    const totalItems = shouldPaginate ? schools.length : totalCount;
    const totalPages = Math.ceil(totalItems / currentLimit);
    
    const displaySchools = shouldPaginate 
        ? schools.slice((currentPage - 1) * currentLimit, currentPage * currentLimit)
        : schools;

    const handlePageSizeChange = (newSize: string) => {
        const newLimit = Number(newSize);
        if (onPageSizeChange) {
            onPageSizeChange(newLimit);
            onPageChange?.(1);
        } else {
            setLocalLimit(newLimit);
            setLocalPage(1);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (onPageChange) {
            onPageChange(newPage);
        } else {
            setLocalPage(newPage);
        }
    };


    const getLocationVariant = (location: string) => (location === 'Urban' ? 'outline' : 'secondary');

    const generatePageNumbers = () => {
        const pages = [];
        const maxVisible = 10;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else if (currentPage <= 3) {
            for (let i = 1; i <= 5; i++) pages.push(i);
        } else if (currentPage >= totalPages - 2) {
            for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
        } else {
            for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
        }
        return pages;
    };

    const pageNumbers = generatePageNumbers();

    const startItem = totalItems > 0 ? (currentPage - 1) * currentLimit + 1 : 0;
    const endItem = Math.min(currentPage * currentLimit, totalItems);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Schools List</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">Show</span>

                        <Select value={currentLimit.toString()} onValueChange={handlePageSizeChange}>
                            <SelectTrigger className="w-20">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>

                            <SelectContent>
                                {pageSizeOptions.map((size) => (
                                    <SelectItem
                                        key={size}
                                        value={size.toString()}
                                        className="px-2 py-1 cursor-pointer hover:bg-gray-100"
                                    >
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <span className="text-sm text-muted-foreground">per page</span>
                    </div>

                    <div className="text-sm text-muted-foreground">
                        {totalItems > 0 ? (
                            <>Showing {startItem} to {endItem} of {totalItems} results</>
                        ) : (
                            'No results found'
                        )}
                    </div>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>School Name</TableHead>
                                <TableHead>Management</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>School Type</TableHead>
                                <TableHead>State</TableHead>
                                <TableHead>District</TableHead>
                                <TableHead>Block</TableHead>
                                <TableHead>Village</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-4">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : displaySchools.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-4">
                                        No schools found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                displaySchools.map((school: School) => (
                                    <TableRow
                                        key={school._id || school.id || school.udise_code}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => onView(school)}
                                    >
                                        <TableCell className="font-medium">{school.school_name}</TableCell>
                                        <TableCell>{school.management_type}</TableCell>
                                        <TableCell>
                                            <Badge variant={getLocationVariant(school.location)}>
                                                {school.location}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{school.school_type}</TableCell>
                                        <TableCell>{school.state}</TableCell>
                                        <TableCell>{school.district}</TableCell>
                                        <TableCell>{school.block}</TableCell>
                                        <TableCell>{school.village}</TableCell>
                                        <TableCell className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                                            <Button
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                                onClick={() => onEdit(school)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                                onClick={() => onDelete(school)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-2 py-4">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(1)}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronFirst className="h-4 w-4" />
                                    </Button>
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                </PaginationItem>
                                {pageNumbers.map((pn) => (
                                    <PaginationItem key={pn}>
                                        <PaginationLink
                                            onClick={() => handlePageChange(pn)}
                                            isActive={pn === currentPage}
                                            className="cursor-pointer"
                                        >
                                            {pn}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                </PaginationItem>
                                <PaginationItem>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(totalPages)}
                                        disabled={currentPage === totalPages}
                                    >
                                        <ChevronLast className="h-4 w-4" />
                                    </Button>
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}