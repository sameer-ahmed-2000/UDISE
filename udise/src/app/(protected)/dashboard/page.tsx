"use client"
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DeleteConfirmModal from "@/components/dashboard/DeleteConfirmModal";
import DistributionCharts from "@/components/dashboard/DistributionCharts";
import FilterBar from "@/components/dashboard/FilterBar";
import SchoolDetailsModal from "@/components/dashboard/SchoolDetailsModal";
import SchoolFormModal from "@/components/dashboard/SchoolFormModal";
import SchoolsTable from "@/components/dashboard/SchoolsTable";
import { Button } from "@/components/ui/button";
import { useSchools } from "@/lib/hooks/useSchools";
import { Filter, School } from "@/types";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function DashboardPage() {
    const [filters, setFilters] = useState<Filter>({});
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const router = useRouter();
    // 🔹 React Query hooks - pass pagination parameters
    const { data, isLoading, refetch } = useSchools(page, pageSize, filters);

    const schools = data?.data || [];
    useEffect(() => {
        const token = Cookies.get("token");

        // Redirect to login if no token
        if (!token) {
            router.push("/login");
            return;
        }
    }, [router]);
    // Debug logging to understand data structure
    console.log('API Response data:', data);
    console.log('Schools array:', schools);
    console.log('First school:', schools[0]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [filters]);

    // 🔹 Modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingSchool, setEditingSchool] = useState<School | null>(null);
    const [viewingSchool, setViewingSchool] = useState<School | null>(null);
    const [deletingSchool, setDeletingSchool] = useState<School | null>(null);

    return (
        <div className="min-h-screen bg-[#def5ff]">
            <DashboardHeader />

            <main className="container mx-auto px-4 py-6 space-y-6">
                {/* 🔹 Filters */}
                <FilterBar filters={filters} setFilters={setFilters} />

                {/* 🔹 Header + Add button */}
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Schools Management
                    </h2>
                    <Button  onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add New School
                    </Button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* 🔹 Schools Table */}
                    <div className="xl:col-span-2">
                        <SchoolsTable
                            schools={schools}
                            isLoading={isLoading}
                            totalCount={data?.total || 0}
                            page={page}
                            pageSize={pageSize}
                            onPageChange={setPage}
                            onPageSizeChange={setPageSize}
                            onView={setViewingSchool}
                            onEdit={setEditingSchool}
                            onDelete={setDeletingSchool}
                        />
                    </div>

                    {/* 🔹 Distribution Charts */}
                    <div className="xl:col-span-1">
                        <DistributionCharts filters={filters} />
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
                onSuccess={refetch}
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