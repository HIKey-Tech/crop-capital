import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { InvestRequest } from '@/types'
import { api } from '@/lib/api-builder'

export function useMyInvestments() {
  return useQuery({
    queryKey: api.investments.mine.$use(),
    queryFn: () => api.$use.investments.mine(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useAllInvestments() {
  return useQuery({
    queryKey: api.investments.all.$use(),
    queryFn: () => api.$use.investments.all(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useInvestment(id: string) {
  return useQuery({
    queryKey: api.investments.detail.$use(id),
    queryFn: () => api.$use.investments.detail(id),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: !!id,
  })
}

export function useInvest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: InvestRequest) => api.$use.investments.invest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: api.investments.mine.$use(),
      })
    },
  })
}

export function useVerifyPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reference: string) =>
      api.$use.investments.verifyPayment(reference),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: api.investments.mine.$use(),
      })
    },
  })
}
