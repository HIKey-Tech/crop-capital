import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Farm } from '@/types'
import { api } from '@/lib/api-builder'

export function useWatchlist() {
  return useQuery({
    queryKey: api.watchlist.list.$use(),
    queryFn: () => api.$use.watchlist.list(),
  })
}

export function useAddToWatchlist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (farmId: string) => api.$use.watchlist.add(farmId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.watchlist.$get() })
    },
  })
}

export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (farmId: string) => api.$use.watchlist.remove(farmId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.watchlist.$get() })
    },
  })
}

export function useIsInWatchlist(farmId: string) {
  const { data } = useWatchlist()

  if (!data?.watchlist) return false

  return data.watchlist.some(
    (farm: Farm) => farm._id === farmId || (farm as any).toString() === farmId,
  )
}
