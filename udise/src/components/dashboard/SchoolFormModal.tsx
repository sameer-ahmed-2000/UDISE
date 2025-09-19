'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useCreateSchool, useUpdateSchool } from '@/lib/hooks/useSchools';
import { School } from '@/types';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

const schoolSchema = z.object({
    udise_code: z.string().min(1, 'UDISE code is required'),
    school_name: z.string().min(1, 'School name is required'),
    state: z.string().min(1, 'State is required'),
    district: z.string().min(1, 'District is required'),
    block: z.string().min(1, 'Block is required'),
    village: z.string().min(1, 'Village is required'),
    location: z.enum(['Urban', 'Rural']),
    management_type: z.enum(['Government', 'Private', 'Aided']),
    school_category: z.enum(['Primary', 'Secondary', 'Higher Secondary']),
    school_type: z.enum(['Boys', 'Girls', 'Co-Ed']),
    school_status: z.enum(['Active', 'Closed', 'Merged']),
});

type SchoolFormData = z.infer<typeof schoolSchema>;

interface SchoolFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    school?: School | null;
}

export default function SchoolFormModal({ isOpen, onClose, school }: SchoolFormModalProps) {
    const createMutation = useCreateSchool();
    const updateMutation = useUpdateSchool();
    const isEdit = !!school;

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
        watch,
    } = useForm<SchoolFormData>({
        resolver: zodResolver(schoolSchema),
        defaultValues: {
            location: 'Rural',
            management_type: 'Government',
            school_category: 'Primary',
            school_type: 'Co-Ed',
            school_status: 'Active',
        },
    });

    useEffect(() => {
        if (school) {
            reset({
                udise_code: school.udise_code,
                school_name: school.school_name,
                state: school.state,
                district: school.district,
                block: school.block,
                village: school.village,
                location: school.location,
                management_type: school.management_type,
                school_category: school.school_category,
                school_type: school.school_type,
                school_status: school.school_status,
            });
        } else {
            reset({
                location: 'Rural',
                management_type: 'Government',
                school_category: 'Primary',
                school_type: 'Co-Ed',
                school_status: 'Active',
            });
        }
    }, [school, reset]);

    const onSubmit = async (data: SchoolFormData) => {
        try {
            if (isEdit && (school?._id || school?.id)) {
                await updateMutation.mutateAsync({
                    id: school._id || school.id!,
                    data,
                });
            } else {
                await createMutation.mutateAsync(data);
            }
            onClose();
        } catch (error) {
            // Error is handled by the mutation hooks
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit School' : 'Add New School'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="udise_code">UDISE Code</Label>
                            <Input
                                id="udise_code"
                                {...register('udise_code')}
                                disabled={isLoading}
                                placeholder="Enter UDISE code"
                            />
                            {errors.udise_code && (
                                <p className="text-sm text-destructive">{errors.udise_code.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="school_name">School Name</Label>
                            <Input
                                id="school_name"
                                {...register('school_name')}
                                disabled={isLoading}
                                placeholder="Enter school name"
                            />
                            {errors.school_name && (
                                <p className="text-sm text-destructive">{errors.school_name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                                id="state"
                                {...register('state')}
                                disabled={isLoading}
                                placeholder="Enter state"
                            />
                            {errors.state && (
                                <p className="text-sm text-destructive">{errors.state.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="district">District</Label>
                            <Input
                                id="district"
                                {...register('district')}
                                disabled={isLoading}
                                placeholder="Enter district"
                            />
                            {errors.district && (
                                <p className="text-sm text-destructive">{errors.district.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="block">Block</Label>
                            <Input
                                id="block"
                                {...register('block')}
                                disabled={isLoading}
                                placeholder="Enter block"
                            />
                            {errors.block && (
                                <p className="text-sm text-destructive">{errors.block.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="village">Village</Label>
                            <Input
                                id="village"
                                {...register('village')}
                                disabled={isLoading}
                                placeholder="Enter village"
                            />
                            {errors.village && (
                                <p className="text-sm text-destructive">{errors.village.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Location</Label>
                            <Select
                                value={watch('location')}
                                onValueChange={(value: 'Urban' | 'Rural') => setValue('location', value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Urban">Urban</SelectItem>
                                    <SelectItem value="Rural">Rural</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.location && (
                                <p className="text-sm text-destructive">{errors.location.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Management Type</Label>
                            <Select
                                value={watch('management_type')}
                                onValueChange={(value: 'Government' | 'Private' | 'Aided') =>
                                    setValue('management_type', value)
                                }
                                disabled={isLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Government">Government</SelectItem>
                                    <SelectItem value="Private">Private</SelectItem>
                                    <SelectItem value="Aided">Aided</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.management_type && (
                                <p className="text-sm text-destructive">{errors.management_type.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>School Category</Label>
                            <Select
                                value={watch('school_category')}
                                onValueChange={(value: 'Primary' | 'Secondary' | 'Higher Secondary') =>
                                    setValue('school_category', value)
                                }
                                disabled={isLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Primary">Primary</SelectItem>
                                    <SelectItem value="Secondary">Secondary</SelectItem>
                                    <SelectItem value="Higher Secondary">Higher Secondary</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.school_category && (
                                <p className="text-sm text-destructive">{errors.school_category.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>School Type</Label>
                            <Select
                                value={watch('school_type')}
                                onValueChange={(value: 'Boys' | 'Girls' | 'Co-Ed') =>
                                    setValue('school_type', value)
                                }
                                disabled={isLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Boys">Boys</SelectItem>
                                    <SelectItem value="Girls">Girls</SelectItem>
                                    <SelectItem value="Co-Ed">Co-Ed</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.school_type && (
                                <p className="text-sm text-destructive">{errors.school_type.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>School Status</Label>
                            <Select
                                value={watch('school_status')}
                                onValueChange={(value: 'Active' | 'Closed' | 'Merged') =>
                                    setValue('school_status', value)
                                }
                                disabled={isLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Closed">Closed</SelectItem>
                                    <SelectItem value="Merged">Merged</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.school_status && (
                                <p className="text-sm text-destructive">{errors.school_status.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {isEdit ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                <>{isEdit ? 'Update School' : 'Create School'}</>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
