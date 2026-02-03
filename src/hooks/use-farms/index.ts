import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { CreateFarmRequest } from '@/types'
import { api } from '@/lib/api-builder'

export function useFarms() {
  return useQuery({
    queryKey: api.farms.list.$use(),
    queryFn: () => api.$use.farms.list(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useFarm(id: string) {
  return useQuery({
    queryKey: api.farms.detail.$use(id),
    queryFn: () => api.$use.farms.detail(id),
    enabled: !!id,
  })
}

export function useCreateFarm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateFarmRequest) => api.$use.farms.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.farms.list.$use() })
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
    }) => api.$use.farms.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: api.farms.detail.$use(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: api.farms.list.$use() })
    },
  })
}

export function useDeleteFarm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.$use.farms.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.farms.list.$use() })
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
    }) => api.$use.farms.addUpdate(id, update),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: api.farms.detail.$use(variables.id),
      })
    },
  })
}
