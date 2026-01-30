import { createContext, useContext } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'

import type { User } from '@/types'

import {
  getAuthToken,
  getMe,
  login as loginFn,
  logout as logoutFn,
  register as registerFn,
} from '@/api/auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (
    name: string,
    email: string,
    password: string,
    country?: string,
  ) => Promise<void>
  logout: () => void
  refetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

const authKeys = {
  me: ['auth', 'me'] as const,
}

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient()

  // Query for fetching current user
  const {
    data: user = null,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      const token = getAuthToken()
      if (!token) return null

      try {
        const response = await getMe()
        return response.user
      } catch {
        // Token is invalid or expired
        logoutFn()
        return null
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  })

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginFn({ email, password }),
    onSuccess: (response) => {
      queryClient.setQueryData(authKeys.me, response.user)
    },
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: ({
      name,
      email,
      password,
      country,
    }: {
      name: string
      email: string
      password: string
      country?: string
    }) => registerFn({ name, email, password, country }),
    onSuccess: (response) => {
      queryClient.setQueryData(authKeys.me, response.user)
    },
  })

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password })
  }

  const register = async (
    name: string,
    email: string,
    password: string,
    country?: string,
  ) => {
    await registerMutation.mutateAsync({ name, email, password, country })
  }

  const logout = () => {
    logoutFn()
    queryClient.setQueryData(authKeys.me, null)
    queryClient.clear()
  }

  const refetchUser = async () => {
    await refetch()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
