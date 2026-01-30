import type {
  AuthResponse,
  CreateFarmRequest,
  FarmResponse,
  FarmsListResponse,
  InvestRequest,
  InvestmentDetailResponse,
  InvestmentResponse,
  InvestmentsListResponse,
  LoginRequest,
  RegisterRequest,
  UserDetailResponse,
  UserStatsResponse,
  UsersListResponse,
} from '@/types'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function getAuthToken(): string | null {
  return localStorage.getItem('token')
}

function setAuthToken(token: string): void {
  localStorage.setItem('token', token)
}

function clearAuthToken(): void {
  localStorage.removeItem('token')
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthToken()

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    ;(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(response.status, data.message || 'An error occurred')
  }

  return data
}

// Auth API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    if (response.token) {
      setAuthToken(response.token)
    }
    return response
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (response.token) {
      setAuthToken(response.token)
    }
    return response
  },

  logout: (): void => {
    clearAuthToken()
  },

  getMe: async () => {
    return request<{ success: boolean; user: AuthResponse['user'] }>('/auth/me')
  },

  updateProfile: async (data: {
    name?: string
    country?: string
    photo?: string
  }) => {
    return request<{
      success: boolean
      message: string
      user: AuthResponse['user']
    }>('/auth/update-profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  updatePassword: async (data: {
    currentPassword: string
    newPassword: string
  }) => {
    return request<{ success: boolean; message: string }>(
      '/auth/update-password',
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
    )
  },
}

// Farms API
export const farmsApi = {
  getAll: async (): Promise<FarmsListResponse> => {
    return request<FarmsListResponse>('/farms')
  },

  getById: async (id: string): Promise<FarmResponse> => {
    return request<FarmResponse>(`/farms/${id}`)
  },

  create: async (data: CreateFarmRequest): Promise<FarmResponse> => {
    return request<FarmResponse>('/farms', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: async (
    id: string,
    data: Partial<CreateFarmRequest>,
  ): Promise<FarmResponse> => {
    return request<FarmResponse>(`/farms/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(`/farms/${id}`, {
      method: 'DELETE',
    })
  },

  addUpdate: async (
    id: string,
    update: { stage: string; image?: string },
  ): Promise<FarmResponse> => {
    return request<FarmResponse>(`/farms/${id}/updates`, {
      method: 'POST',
      body: JSON.stringify(update),
    })
  },
}

// Investments API
export const investmentsApi = {
  getMyInvestments: async (): Promise<InvestmentsListResponse> => {
    return request<InvestmentsListResponse>('/investments/me')
  },

  getAllInvestments: async (): Promise<InvestmentsListResponse> => {
    return request<InvestmentsListResponse>('/investments')
  },

  getById: async (id: string): Promise<InvestmentDetailResponse> => {
    return request<InvestmentDetailResponse>(`/investments/${id}`)
  },

  invest: async (data: InvestRequest): Promise<InvestmentResponse> => {
    return request<InvestmentResponse>('/investments', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  verifyPayment: async (
    reference: string,
  ): Promise<{ success: boolean; investment: object }> => {
    return request<{ success: boolean; investment: object }>(
      `/investments/verify/${reference}`,
    )
  },
}

// Users API (Admin)
export const usersApi = {
  getAll: async (): Promise<UsersListResponse> => {
    return request<UsersListResponse>('/users')
  },

  getById: async (id: string): Promise<UserDetailResponse> => {
    return request<UserDetailResponse>(`/users/${id}`)
  },

  getStats: async (): Promise<UserStatsResponse> => {
    return request<UserStatsResponse>('/users/stats')
  },
}

// Export utilities
export { ApiError, clearAuthToken, getAuthToken, setAuthToken }
