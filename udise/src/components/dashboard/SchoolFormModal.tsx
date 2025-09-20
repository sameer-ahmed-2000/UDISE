'use client';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const schoolSchema = z.object({
    udise_code: z.string().min(1, 'UDISE code is required'),
    school_name: z.string().min(1, 'School name is required'),
    state: z.string().min(1, 'State is required'),
    district: z.string().min(1, 'District is required'),
    block: z.string().min(1, 'Block is required'),
    village: z.string().min(1, 'Village is required'),
    location: z.enum(['Urban', 'Rural']),
    management_type: z.enum(['Government', 'Private', 'Aided']),
    school_category: z.string().min(1, 'School category is required'),
    school_type: z.enum(['Boys', 'Girls', 'Co-Ed']),
    school_status: z.enum(['Active', 'Closed', 'Merged']),
});

type SchoolFormData = z.infer<typeof schoolSchema>;

interface SchoolFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    school?: School | null;
    onSuccess?: () => void
}

export default function SchoolFormModal({ isOpen, onClose, school, onSuccess }: SchoolFormModalProps) {
    const createMutation = useCreateSchool();
    const updateMutation = useUpdateSchool();
    const [states, setStates] = useState<string[]>([]);
    const [districts, setDistricts] = useState<string[]>([]);
    const [blocks, setBlocks] = useState<string[]>([]);
    const [villages, setVillages] = useState<string[]>([]);
    const token = Cookies.get('token'); // or your auth token
    const queryClient = useQueryClient()
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
            udise_code: '',
            school_name: '',
            state: '',
            district: '',
            block: '',
            village: '',
            location: 'Rural',
            management_type: 'Government',
            school_category: 'Primary',
            school_type: 'Co-Ed',
            school_status: 'Active',
        },
    });

    // Reset form when school prop changes (edit -> create or create -> edit)
    useEffect(() => {
        if (school) {
            // Edit mode - populate with school data
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
            // Create mode - reset to default values and clear all dropdowns
            reset({
                udise_code: '',
                school_name: '',
                state: '',
                district: '',
                block: '',
                village: '',
                location: 'Rural',
                management_type: 'Government',
                school_category: 'Primary',
                school_type: 'Co-Ed',
                school_status: 'Active',
            });
            // Clear all dropdown options
            setDistricts([]);
            setBlocks([]);
            setVillages([]);
        }
    }, [school, reset]);

    // Cleanup when modal closes
    useEffect(() => {
        if (!isOpen) {
            // Reset form to initial state when modal closes
            reset({
                udise_code: '',
                school_name: '',
                state: '',
                district: '',
                block: '',
                village: '',
                location: 'Rural',
                management_type: 'Government',
                school_category: 'Primary',
                school_type: 'Co-Ed',
                school_status: 'Active',
            });
            // Clear dropdowns
            setDistricts([]);
            setBlocks([]);
            setVillages([]);
        }
    }, [isOpen, reset]);
    const fetchOptions = async (level: string, parent?: Record<string, string>) => {
        try {
            // Build params ensuring we don't send empty values
            const params: any = {};
            if (parent) {
                // Only add non-empty, non-null, non-undefined values
                Object.keys(parent).forEach(key => {
                    if (parent[key]) {
                        params[key] = parent[key];
                    }
                });
            }

            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/data/filter`, {
                headers: { Authorization: `Bearer ${token}` },
                params,
            });

            const data = (res.data as { data: string[] }).data;
            switch (level) {
                case 'state': setStates(data); break;
                case 'district': setDistricts(data); break;
                case 'block': setBlocks(data); break;
                case 'village': setVillages(data); break;
            }
        } catch (err: any) {
            console.error(`Failed to fetch ${level}:`, err);
            // Show user-friendly error message
            if (err.response?.status === 400) {
                console.error(`Invalid parameters for ${level} filter request`);
            } else {
                console.error(`Network error when fetching ${level} options`);
            }
        }
    };

    // Initial load - fetch states when component mounts
    useEffect(() => { 
        fetchOptions('state'); 
    }, []);

    // When state changes
    useEffect(() => {
        const stateValue = watch('state');
        if (stateValue) {
            fetchOptions('district', { state: stateValue });
            setValue('district', '');
            setBlocks([]);
            setVillages([]);
        } else {
            setDistricts([]);
            setBlocks([]);
            setVillages([]);
        }
    }, [watch('state')]);

    // When district changes
    useEffect(() => {
        const stateValue = watch('state');
        const districtValue = watch('district');
        
        if (stateValue && districtValue) {
            fetchOptions('block', { state: stateValue, district: districtValue });
            setValue('block', '');
            setVillages([]);
        } else {
            setBlocks([]);
            setVillages([]);
        }
    }, [watch('state'), watch('district')]);

    // When block changes
    useEffect(() => {
        const stateValue = watch('state');
        const districtValue = watch('district');
        const blockValue = watch('block');
        
        if (stateValue && districtValue && blockValue) {
            fetchOptions('village', { state: stateValue, district: districtValue, block: blockValue });
            setValue('village', '');
        } else {
            setVillages([]);
        }
    }, [watch('state'), watch('district'), watch('block')]);

    // In your SchoolFormModal component, update the onSubmit function:

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
            // The mutation hooks will handle query invalidation automatically
            onClose();
            // Reset form after successful submission
            reset({
                udise_code: '',
                school_name: '',
                state: '',
                district: '',
                block: '',
                village: '',
                location: 'Rural',
                management_type: 'Government',
                school_category: 'Primary',
                school_type: 'Co-Ed',
                school_status: 'Active',
            });
            // Clear dropdowns
            setDistricts([]);
            setBlocks([]);
            setVillages([]);
            // Call the success callback if provided
            onSuccess?.();
        } catch (error: any) {
            // Error is handled by the mutation hooks
            console.error('Form submission error:', error);
            // Show user-friendly error message
            if (error.response?.status === 400) {
                console.error('Validation error in form submission');
            } else {
                console.error('Network error during form submission');
            }
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader >
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
                            <Select
                                value={watch('state') || ''}
                                onValueChange={v => setValue('state', v)}
                                disabled={isLoading}
                            >
                                <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                                <SelectContent>
                                    {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {errors.state && (
                                <p className="text-sm text-destructive">{errors.state.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="district">District</Label>
                            <Select
                                value={watch('district') || ''}
                                onValueChange={v => setValue('district', v)}
                                disabled={!watch('state') || isLoading}
                            >
                                <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                                <SelectContent>
                                    {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {errors.district && (
                                <p className="text-sm text-destructive">{errors.district.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="block">Block</Label>
                            <Select
                                value={watch('block') || ''}
                                onValueChange={v => setValue('block', v)}
                                disabled={!watch('district') || isLoading}
                            >
                                <SelectTrigger><SelectValue placeholder="Select block" /></SelectTrigger>
                                <SelectContent>
                                    {blocks.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {errors.block && (
                                <p className="text-sm text-destructive">{errors.block.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="village">Village</Label>
                            <Select
                                value={watch('village') || ''}
                                onValueChange={v => setValue('village', v)}
                                disabled={!watch('block') || isLoading}
                            >
                                <SelectTrigger><SelectValue placeholder="Select village" /></SelectTrigger>
                                <SelectContent>
                                    {villages.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                </SelectContent>
                            </Select>
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
