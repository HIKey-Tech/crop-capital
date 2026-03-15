import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-builder'

export function useUsers() {
  return useQuery({
    queryKey: api.users.list.$use(),
    queryFn: () => api.$use.users.list(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: api.users.detail.$use(id),
    queryFn: () => api.$use.users.detail(id),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: !!id,
  })
}

export function useUserStats() {
  return useQuery({
    queryKey: api.users.stats.$use(),
    queryFn: () => api.$use.users.stats(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function usePromoteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.$use.users.promote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.users.list.$use() })
      queryClient.invalidateQueries({ queryKey: api.users.stats.$use() })
    },
  })
}

export function useDemoteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.$use.users.demote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.users.list.$use() })
      queryClient.invalidateQueries({ queryKey: api.users.stats.$use() })
    },
  })
}

export function useDashboardStats() {
  return useQuery({
    queryKey: api.users.dashboardStats.$use(),
    queryFn: () => api.$use.users.dashboardStats(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}
