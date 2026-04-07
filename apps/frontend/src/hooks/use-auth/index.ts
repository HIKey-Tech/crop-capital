import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type {
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
} from '@/types'
import { api } from '@/lib/api-builder'
import { clearAuthToken } from '@/lib/api-client'

export function useCurrentUser() {
  return useQuery({
    queryKey: api.auth.me.$use(),
    queryFn: () => api.$use.auth.me(),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: LoginRequest) => api.$use.auth.login(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.auth.$get() })
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RegisterRequest) => api.$use.auth.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.auth.$get() })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      clearAuthToken()
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.clear()
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) =>
      api.$use.auth.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.auth.me.$use() })
    },
  })
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      api.$use.auth.updatePassword(data),
  })
}

export function usePaystackBanks(country?: string) {
  const normalizedCountry = country?.trim() ?? ''

  return useQuery({
    queryKey: ['paystack-banks', normalizedCountry],
    queryFn: () => api.$use.payments.banks(normalizedCountry),
    enabled: normalizedCountry.length > 0,
    staleTime: 1000 * 60 * 60,
  })
}

export function usePaystackAccountResolution(
  bankCode?: string,
  accountNumber?: string,
  enabled = true,
) {
  const normalizedBankCode = bankCode?.trim() ?? ''
  const normalizedAccountNumber = accountNumber?.replace(/\s+/g, '') ?? ''

  return useQuery({
    queryKey: [
      'paystack-account-resolution',
      normalizedBankCode,
      normalizedAccountNumber,
    ],
    queryFn: () =>
      api.$use.payments.resolveAccount(
        normalizedBankCode,
        normalizedAccountNumber,
      ),
    enabled:
      enabled &&
      normalizedBankCode.length > 0 &&
      normalizedAccountNumber.length >= 6 &&
      normalizedAccountNumber.length <= 20,
    retry: false,
    staleTime: 1000 * 60 * 10,
  })
}
