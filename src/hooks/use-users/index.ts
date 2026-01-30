import { useQuery } from '@tanstack/react-query'

import { usersApi } from '@/lib/api-client'

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  stats: () => [...userKeys.all, 'stats'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
}

export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: () => usersApi.getAll(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.getById(id),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: !!id,
  })
}

export function useUserStats() {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: () => usersApi.getStats(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}
