import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { CreateFarmRequest } from '@/types'

import { farmsApi } from '@/lib/api-client'

export const farmKeys = {
  all: ['farms'] as const,
  lists: () => [...farmKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...farmKeys.lists(), filters] as const,
  details: () => [...farmKeys.all, 'detail'] as const,
  detail: (id: string) => [...farmKeys.details(), id] as const,
}

export function useFarms() {
  return useQuery({
    queryKey: farmKeys.lists(),
    queryFn: () => farmsApi.getAll(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useFarm(id: string) {
  return useQuery({
    queryKey: farmKeys.detail(id),
    queryFn: () => farmsApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateFarm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateFarmRequest) => farmsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmKeys.lists() })
    },
  })
}

export function useUpdateFarm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Partial<CreateFarmRequest>
    }) => farmsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: farmKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: farmKeys.lists() })
    },
  })
}

export function useDeleteFarm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => farmsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmKeys.lists() })
    },
  })
}

export function useAddFarmUpdate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      update,
    }: {
      id: string
      update: { stage: string; image?: string }
    }) => farmsApi.addUpdate(id, update),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: farmKeys.detail(variables.id) })
    },
  })
}
