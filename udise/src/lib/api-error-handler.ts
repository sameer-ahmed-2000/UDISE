import { toast } from 'sonner'

export interface ApiError {
    message: string
    status: number
    code?: string
}

export function handleApiError(error: any): ApiError {
    if (error.response) {
        // Server responded with error status
        const status = error.response.status
        const message = error.response.data?.message || 'An error occurred'

        switch (status) {
            case 400:
                toast.error('Invalid request data')
                break
            case 401:
                toast.error('Authentication required')
                break
            case 403:
                toast.error('Access denied')
                break
            case 404:
                toast.error('Resource not found')
                break
            case 500:
                toast.error('Server error occurred')
                break
            default:
                toast.error(message)
        }

        return { message, status, code: error.response.data?.code }
    } else if (error.request) {
        // Network error
        toast.error('Network error - please check your connection')
        return { message: 'Network error', status: 0 }
    } else {
        // Other error
        toast.error('An unexpected error occurred')
        return { message: error.message || 'Unknown error', status: 0 }
    }
}
