'use client';

import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { School } from '@/types';
import { Copy } from 'lucide-react';

interface SchoolDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    school: School | null; // receive full school from parent
}

type DetailItem = { label: string; value: string; isBadge?: boolean; isCopy?: boolean };
type DetailGroup = { title: string; items: DetailItem[] };

export default function SchoolDetailsModal({ isOpen, onClose, school }: SchoolDetailsModalProps) {
    if (!school) return null;

    const handleCopy = (value: string) => navigator.clipboard.writeText(value);

    const getStatusVariant = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
            Operational: 'default',
            Closed: 'destructive',
            Merged: 'secondary',
        };
        return variants[status] || 'default';
    };

    const detailGroups: DetailGroup[] = [
        {
            title: 'Identifiers',
            items: [{ label: 'UDISE Code', value: school.udise_code, isCopy: true }],
        },
        {
            title: 'Basic Information',
            items: [
                { label: 'School Name', value: school.school_name },
                { label: 'Status', value: school.school_status, isBadge: true },
                { label: 'Management Type', value: school.management_type },
                { label: 'School Category', value: school.school_category },
                { label: 'School Type', value: school.school_type },
            ],
        },
        {
            title: 'Location',
            items: [
                { label: 'State', value: school.state },
                { label: 'District', value: school.district },
                { label: 'Block', value: school.block },
                { label: 'Village', value: school.village },
                { label: 'Location Type', value: school.location, isBadge: true },
            ],
        },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl w-full rounded-2xl shadow-2xl border border-border bg-background/90 backdrop-blur-lg p-0">
                <DialogHeader className="sticky top-0 z-20 bg-background/95 p-6 border-b">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl font-bold">School Details</DialogTitle>
                            <DialogDescription>Complete profile of the selected school</DialogDescription>
                        </div>
                        <DialogClose asChild>
                            <button className="p-2 rounded-full hover:bg-accent focus:outline-none transition">
                                <span className="sr-only">Close</span>
                                <svg width="20" height="20" fill="none" stroke="currentColor">
                                    <path d="M4 4l12 12M4 16L16 4" />
                                </svg>
                            </button>
                        </DialogClose>
                    </div>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] px-6 py-5">
                    {detailGroups.map((group, idx) => (
                        <div key={idx} className="mb-7">
                            <h3 className="text-xs font-semibold uppercase mb-2 text-muted-foreground tracking-wide">
                                {group.title}
                            </h3>
                            <div className="space-y-3">
                                {group.items.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center py-1">
                                        <span className="text-sm font-medium text-primary min-w-[150px] text-left">{item.label}:</span>
                                        {item.isBadge ? (
                                            <Badge
                                                variant={item.label === 'Status'
                                                    ? getStatusVariant(item.value)
                                                    : item.value === 'Urban' ? 'outline' : 'secondary'}
                                                className="ml-1 px-2 py-1 text-xs text-right"
                                            >
                                                {item.value}
                                            </Badge>
                                        ) : (
                                            <span
                                                className="flex items-center gap-2 text-sm text-muted-foreground truncate max-w-[280px] text-right"
                                                title={item.value}
                                            >
                                                {item.value}
                                                {item.isCopy && (
                                                    <button
                                                        onClick={() => handleCopy(item.value)}
                                                        className="hover:bg-muted/60 rounded-full p-1 transition"
                                                        title="Copy Value"
                                                    >
                                                        <Copy size={14} />
                                                    </button>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {idx < detailGroups.length - 1 && <Separator className="my-5" />}
                        </div>
                    ))}
                    {school.createdAt && (
                        <div className="space-y-2 text-xs text-muted-foreground">
                            <Separator className="my-3" />
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
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
