import {
  
  createContext,
  useContext,
  useEffect,
  useState
} from 'react'
import type {ReactNode} from 'react';

import type { User } from '@/types'

import { authApi, getAuthToken } from '@/lib/api-client'

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = async () => {
    const token = getAuthToken()
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const response = await authApi.getMe()
      setUser(response.user)
    } catch {
      // Token is invalid or expired
      authApi.logout()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password })
    setUser(response.user)
  }

  const register = async (
    name: string,
    email: string,
    password: string,
    country?: string,
  ) => {
    const response = await authApi.register({ name, email, password, country })
    setUser(response.user)
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
  }

  const refetchUser = async () => {
    await fetchUser()
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
