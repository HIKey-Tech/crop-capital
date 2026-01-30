import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { InvestRequest } from '@/types'

import { investmentsApi } from '@/lib/api-client'

export const investmentKeys = {
  all: ['investments'] as const,
  lists: () => [...investmentKeys.all, 'list'] as const,
  myInvestments: () => [...investmentKeys.lists(), 'mine'] as const,
  allInvestments: () => [...investmentKeys.lists(), 'all'] as const,
}

export function useMyInvestments() {
  return useQuery({
    queryKey: investmentKeys.myInvestments(),
    queryFn: () => investmentsApi.getMyInvestments(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useAllInvestments() {
  return useQuery({
    queryKey: investmentKeys.allInvestments(),
    queryFn: () => investmentsApi.getAllInvestments(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useInvest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: InvestRequest) => investmentsApi.invest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: investmentKeys.myInvestments(),
      })
    },
  })
}

export function useVerifyPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reference: string) => investmentsApi.verifyPayment(reference),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: investmentKeys.myInvestments(),
      })
    },
  })
}
