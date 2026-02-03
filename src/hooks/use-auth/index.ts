import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { LoginRequest, RegisterRequest } from '@/types'
import { api } from '@/lib/api-builder'

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
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
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
    mutationFn: (data: { name?: string; country?: string; photo?: string }) =>
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
