'use client';
/* eslint-disable */
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteSchool } from '@/lib/hooks/useSchools';
import { School } from '@/types';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    school: School | null;
}

export default function DeleteConfirmModal({
    isOpen,
    onClose,
    school,
}: DeleteConfirmModalProps) {
    const deleteSchoolMutation = useDeleteSchool();

    if (!school) return null;

    const handleDelete = async () => {
        if (!school.id && !school._id) return;

        // Optimistic deletion handled in mutation hook
        await deleteSchoolMutation.mutateAsync(school.id || school._id!);
        onClose();
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the school
                        <span className="font-semibold"> "{school.school_name}"</span> from the list.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
