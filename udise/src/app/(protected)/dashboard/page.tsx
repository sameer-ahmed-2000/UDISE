'use client';

import { useState } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import FilterBar from '@/components/dashboard/FilterBar';
import SchoolsTable from '@/components/dashboard/SchoolsTable';
import DistributionCharts from '@/components/dashboard/DistributionCharts';
import SchoolFormModal from '@/components/dashboard/SchoolFormModal';
import SchoolDetailsModal from '@/components/dashboard/SchoolDetailsModal';
import DeleteConfirmModal from '@/components/dashboard/DeleteConfirmModal';
import { School } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useFilters } from '@/lib/hooks/useFilters';


export default function DashboardPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingSchool, setEditingSchool] = useState<School | null>(null);
    const [viewingSchool, setViewingSchool] = useState<School | null>(null);
    const [deletingSchool, setDeletingSchool] = useState<School | null>(null);

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader />

            <main className="container mx-auto px-4 py-6 space-y-6">
                <FilterBar />

                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Schools Management</h2>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add New School
                    </Button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2">
                        <SchoolsTable
                            onView={setViewingSchool}
                            onEdit={setEditingSchool}
                            onDelete={setDeletingSchool}
                        />
                    </div>

                    <div className="xl:col-span-1">
                        <DistributionCharts />
                    </div>
                </div>
            </main>

            <SchoolFormModal
                isOpen={isCreateModalOpen || !!editingSchool}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setEditingSchool(null);
                }}
                school={editingSchool}
            />

            <SchoolDetailsModal
                isOpen={!!viewingSchool}
                onClose={() => setViewingSchool(null)}
                school={viewingSchool}
            />

            <DeleteConfirmModal
                isOpen={!!deletingSchool}
                onClose={() => setDeletingSchool(null)}
                school={deletingSchool}
            />
        </div>
    );
}
