import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type {
  CreateCommodityMultipartRequest,
  CreateCommodityOrderRequest,
  UpdateCommodityOrderStatusRequest,
  UpdateCommodityRequest,
} from '@/types'
import { api } from '@/lib/api-builder'

export function useCommodities() {
  return useQuery({
    queryKey: api.commodities.list.$use(),
    queryFn: () => api.$use.commodities.list(),
    staleTime: 1000 * 60,
  })
}

export function useCommodity(id: string) {
  return useQuery({
    queryKey: api.commodities.detail.$use(id),
    queryFn: () => api.$use.commodities.detail(id),
    enabled: !!id,
  })
}

export function useCreateCommodity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCommodityMultipartRequest) =>
      api.$use.commodities.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.commodities.list.$use() })
    },
  })
}

export function useUpdateCommodity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCommodityRequest }) =>
      api.$use.commodities.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: api.commodities.detail.$use(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: api.commodities.list.$use() })
    },
  })
}

export function useDeleteCommodity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.$use.commodities.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.commodities.list.$use() })
      queryClient.invalidateQueries({ queryKey: api.commodities.orders.$use() })
    },
  })
}

export function useCommodityOrders() {
  return useQuery({
    queryKey: api.commodities.orders.$use(),
    queryFn: () => api.$use.commodities.orders(),
  })
}

export function useMyCommodityOrders() {
  return useQuery({
    queryKey: api.commodities.myOrders.$use(),
    queryFn: () => api.$use.commodities.myOrders(),
  })
}

export function useCreateCommodityOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCommodityOrderRequest) =>
      api.$use.commodities.placeOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.commodities.list.$use() })
      queryClient.invalidateQueries({ queryKey: api.commodities.orders.$use() })
      queryClient.invalidateQueries({
        queryKey: api.commodities.myOrders.$use(),
      })
    },
  })
}

export function useVerifyOrderPayment() {
  return useMutation({
    mutationFn: (reference: string) =>
      api.$use.commodities.verifyOrderPayment(reference),
  })
}

export function useUpdateCommodityOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: UpdateCommodityOrderStatusRequest
    }) => api.$use.commodities.updateOrderStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.commodities.list.$use() })
      queryClient.invalidateQueries({ queryKey: api.commodities.orders.$use() })
      queryClient.invalidateQueries({
        queryKey: api.commodities.myOrders.$use(),
      })
    },
  })
}
