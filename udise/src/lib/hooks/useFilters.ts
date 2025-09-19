'use client'

import api from '@/lib/api'
import type { Filter, FilterOptions } from '@/lib/types'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export function useFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Initialize filters from URL
    const [filters, setFilters] = useState<Filter>({
        state: searchParams.get('state') || undefined,
        district: searchParams.get('district') || undefined,
        block: searchParams.get('block') || undefined,
        village: searchParams.get('village') || undefined,
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '10'),
    })

    // Fetch filter options
    const { data: options = { states: [], districts: [], blocks: [], villages: [] } } = useQuery({
        queryKey: ['filter-options', filters],
        queryFn: async (): Promise<FilterOptions> => {
            const params = new URLSearchParams()
            if (filters.state) params.append('state', filters.state)
            if (filters.district) params.append('district', filters.district)
            if (filters.block) params.append('block', filters.block)

            const { data } = await api.get<FilterOptions>(`/data/filters?${params}`)
            return data
        },
    })

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value)
        })

        const newUrl = `${window.location.pathname}?${params}`
        router.replace(newUrl, { scroll: false })
    }, [filters, router])

    const updateFilter = (key: keyof Filter, value: string | number | undefined) => {
        setFilters(prev => {
            const newFilters = { ...prev, [key]: value }

            // Clear dependent filters when parent changes
            if (key === 'state') {
                newFilters.district = undefined
                newFilters.block = undefined
                newFilters.village = undefined
                newFilters.page = 1
            } else if (key === 'district') {
                newFilters.block = undefined
                newFilters.village = undefined
                newFilters.page = 1
            } else if (key === 'block') {
                newFilters.village = undefined
                newFilters.page = 1
            }

            return newFilters
        })
    }

    return {
        filters,
        options,
        updateFilter,
        clearFilters: () => setFilters({ state: undefined, district: undefined, block: undefined, village: undefined, page: 1, limit: 10 }),
    }
}
