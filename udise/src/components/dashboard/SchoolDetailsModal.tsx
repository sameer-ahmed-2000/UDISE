'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { School } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface SchoolDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    school: School | null;
}

export default function SchoolDetailsModal({ isOpen, onClose, school }: SchoolDetailsModalProps) {
    if (!school) return null;

    const detailGroups = [
        {
            title: 'Basic Information',
            items: [
                { label: 'UDISE Code', value: school.udise_code },
                { label: 'School Name', value: school.school_name },
                { label: 'Status', value: school.school_status, isBadge: true },
            ],
        },
        {
            title: 'Location Details',
            items: [
                { label: 'State', value: school.state },
                { label: 'District', value: school.district },
                { label: 'Block', value: school.block },
                { label: 'Village', value: school.village },
                { label: 'Location Type', value: school.location, isBadge: true },
            ],
        },
        {
            title: 'School Configuration',
            items: [
                { label: 'Management Type', value: school.management_type },
                { label: 'School Category', value: school.school_category },
                { label: 'School Type', value: school.school_type },
            ],
        },
    ];

    const getStatusVariant = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
            Active: 'default',
            Closed: 'destructive',
            Merged: 'secondary',
        };
        return variants[status] || 'default';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>School Details</DialogTitle>
                    <DialogDescription>Complete information about the school</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[500px] pr-4">
                    {detailGroups.map((group, groupIndex) => (
                        <div key={groupIndex} className="mb-6">
                            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                                {group.title}
                            </h3>
                            <div className="space-y-2">
                                {group.items.map((item, itemIndex) => (
                                    <div key={itemIndex} className="flex justify-between items-center py-2">
                                        <span className="text-sm font-medium">{item.label}:</span>
                                        {item.isBadge ? (
                                            <Badge
                                                variant={
                                                    item.label === 'Status'
                                                        ? getStatusVariant(item.value)
                                                        : item.value === 'Urban'
                                                            ? 'outline'
                                                            : 'secondary'
                                                }
                                            >
                                                {item.value}
                                            </Badge>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">{item.value}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {groupIndex < detailGroups.length - 1 && <Separator className="mt-4" />}
                        </div>
                    ))}
                    {school.createdAt && (
                        <>
                            <Separator className="my-4" />
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex justify-between">
                                    <span>Created At:</span>
                                    <span>{new Date(school.createdAt).toLocaleDateString()}</span>
                                </div>
                                {school.updatedAt && (
                                    <div className="flex justify-between">
                                        <span>Updated At:</span>
                                        <span>{new Date(school.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}