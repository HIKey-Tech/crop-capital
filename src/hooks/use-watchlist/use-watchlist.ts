import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Farm } from '@/types'
import { watchlistApi } from '@/api/watchlist'

export const watchlistKeys = {
  all: ['watchlist'] as const,
  list: () => [...watchlistKeys.all, 'list'] as const,
}

export function useWatchlist() {
  return useQuery({
    queryKey: watchlistKeys.list(),
    queryFn: watchlistApi.getWatchlist,
  })
}

export function useAddToWatchlist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (farmId: string) => watchlistApi.addToWatchlist(farmId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: watchlistKeys.all })
    },
  })
}

export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (farmId: string) => watchlistApi.removeFromWatchlist(farmId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: watchlistKeys.all })
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
