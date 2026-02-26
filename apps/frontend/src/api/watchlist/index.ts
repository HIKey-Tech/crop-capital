import type { Farm } from '@/types'
import { request } from '@/lib/api-client'

interface WatchlistResponse {
  success: boolean
  watchlist: Array<Farm>
}

interface WatchlistActionResponse {
  success: boolean
  message: string
  watchlist: Array<string>
}

export const watchlistApi = {
  getWatchlist: async (): Promise<WatchlistResponse> => {
    const response = await request<WatchlistResponse>(
      '/users/watchlist/all',
    )
    return response
  },

  addToWatchlist: async (farmId: string): Promise<WatchlistActionResponse> => {
    const response = await request<WatchlistActionResponse>(
      '/users/watchlist',
      {
        method: 'POST',
        body: JSON.stringify({ farmId }),
      },
    )
    return response
  },

  removeFromWatchlist: async (
    farmId: string,
  ): Promise<WatchlistActionResponse> => {
    const response = await request<WatchlistActionResponse>(
      `/users/watchlist/${farmId}`,
      {
        method: 'DELETE',
      },
    )
    return response
  },
}
