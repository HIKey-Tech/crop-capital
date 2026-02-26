import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { KycSubmitRequest } from '@/types'
import { api } from '@/lib/api-builder'

export function useMyKyc() {
  return useQuery({
    queryKey: api.kyc.me.$use(),
    queryFn: () => api.$use.kyc.me(),
    staleTime: 1000 * 60 * 2,
  })
}

export function useSubmitKyc() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: KycSubmitRequest) => api.$use.kyc.submit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.kyc.me.$use() })
    },
  })
}

export function useResubmitKyc() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: KycSubmitRequest) => api.$use.kyc.resubmit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.kyc.me.$use() })
    },
  })
}

export function useKycSubmissions(status?: string) {
  return useQuery({
    queryKey: [...api.kyc.list.$use(), status],
    queryFn: () => api.$use.kyc.list(status),
    staleTime: 1000 * 60 * 2,
  })
}

export function useKycDetail(id: string) {
  return useQuery({
    queryKey: api.kyc.detail.$use(id),
    queryFn: () => api.$use.kyc.detail(id),
    enabled: !!id,
  })
}

export function useApproveKyc() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.$use.kyc.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.kyc.$get() })
    },
  })
}

export function useRejectKyc() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.$use.kyc.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.kyc.$get() })
    },
  })
}
