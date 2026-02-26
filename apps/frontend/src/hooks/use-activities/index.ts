import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-builder'

export function useActivities(params?: {
  page?: number
  limit?: number
  type?: string
}) {
  return useQuery({
    queryKey: [...api.activities.list.$use(), params],
    queryFn: () => api.$use.activities.list(params),
    staleTime: 1000 * 60, // 1 minute
  })
}
