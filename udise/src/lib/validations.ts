import { z } from 'zod'

export const schoolSchema = z.object({
    udise_code: z.string().min(1, 'UDISE code is required'),
    school_name: z.string().min(1, 'School name is required'),
    state: z.string().min(1, 'State is required'),
    district: z.string().min(1, 'District is required'),
    block: z.string().min(1, 'Block is required'),
    village: z.string().min(1, 'Village is required'),
    location: z.enum(['Urban', 'Rural']),
    management_type: z.enum(['Government', 'Private', 'Aided']),
    school_category: z.enum(['Primary', 'Upper Primary', 'Secondary', 'Higher Secondary']),
    school_type: z.enum(['Co-Ed', 'Boys', 'Girls']),
    school_status: z.enum(['Functional', 'Closed', 'Merged']),
})

export type SchoolFormData = z.infer<typeof schoolSchema>

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginFormData = z.infer<typeof loginSchema>
