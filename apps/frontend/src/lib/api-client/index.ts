import type {
  ActivitiesListResponse,
  AssignUsersResponse,
  AuthResponse,
  CreateFarmRequest,
  CreateTenantRequest,
  FarmResponse,
  FarmsListResponse,
  InvestRequest,
  InvestmentDetailResponse,
  InvestmentResponse,
  InvestmentsListResponse,
  KycDetailResponse,
  KycListResponse,
  KycMyResponse,
  KycReviewResponse,
  KycSubmitRequest,
  KycSubmitResponse,
  LoginRequest,
  RegisterRequest,
  TenantBootstrapResponse,
  TenantMutationResponse,
  TenantsListResponse,
  UpdateTenantRequest,
  UserDetailResponse,
  UserStatsResponse,
  UsersListResponse,
} from '@/types'

function resolveApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim()
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '')
  }

  if (typeof window !== 'undefined') {
    const isLocalHost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'

    if (isLocalHost) {
      console.warn(
        '⚠️ VITE_API_BASE_URL is not defined, defaulting to http://localhost:5123/api',
      )
      return 'http://localhost:5123/api'
    }

    console.warn(
      '⚠️ VITE_API_BASE_URL is not defined, defaulting to same-origin /api',
    )
    return `${window.location.origin}/api`
  }

  return 'http://localhost:5123/api'
}

const API_BASE_URL = resolveApiBaseUrl()

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem('token')
}

export function setAuthToken(token: string): void {
  localStorage.setItem('token', token)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken')
}

export function setRefreshToken(token: string): void {
  localStorage.setItem('refreshToken', token)
}

// View mode management (sessionStorage - resets each session for security)
export type ViewMode = 'admin' | 'investor'

export function getViewMode(): ViewMode | null {
  if (typeof window === 'undefined') return null
  const stored = sessionStorage.getItem('viewMode')
  return stored === 'admin' || stored === 'investor' ? stored : null
}

export function setViewMode(mode: ViewMode): void {
  sessionStorage.setItem('viewMode', mode)
}

export function clearViewMode(): void {
  sessionStorage.removeItem('viewMode')
}

// Clear all auth state (tokens + view mode)
export function clearAuthToken(): void {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  clearViewMode()
}

function resolveTenantSlugFromHost(): string | null {
  if (typeof window === 'undefined') return null

  const host = window.location.hostname.toLowerCase()
  const platformRoot = import.meta.env.VITE_PLATFORM_ROOT_DOMAIN as
    | string
    | undefined

  if (!platformRoot) return null

  if (!host.endsWith(platformRoot.toLowerCase())) return null

  const suffix = `.${platformRoot.toLowerCase()}`
  if (!host.endsWith(suffix)) return null

  const prefix = host.slice(0, -suffix.length)
  if (!prefix) return null

  const parts = prefix.split('.').filter(Boolean)
  return parts.length ? parts[parts.length - 1] : null
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const tenantSlug = resolveTenantSlugFromHost()
  if (tenantSlug) {
    headers['X-Tenant-Slug'] = tenantSlug
  }

  const normalizedEndpoint = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`
  const url = `${API_BASE_URL}${normalizedEndpoint}`
  const response = await fetch(url, { ...options, headers })
  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(response.status, data.message || 'An error occurred')
  }

  return data
}

export const tenantApi = {
  bootstrap: async (): Promise<TenantBootstrapResponse> => {
    return request<TenantBootstrapResponse>('/tenants/bootstrap')
  },
  list: async (): Promise<TenantsListResponse> => {
    return request<TenantsListResponse>('/tenants')
  },
  create: async (
    data: CreateTenantRequest,
  ): Promise<TenantMutationResponse> => {
    return request<TenantMutationResponse>('/tenants', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  update: async (
    id: string,
    data: UpdateTenantRequest,
  ): Promise<TenantMutationResponse> => {
    return request<TenantMutationResponse>(`/tenants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },
  assignUnassignedUsers: async (id: string): Promise<AssignUsersResponse> => {
    return request<AssignUsersResponse>(
      `/tenants/${id}/assign-unassigned-users`,
      {
        method: 'POST',
      },
    )
  },
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
    if (response.refreshToken) {
      setRefreshToken(response.refreshToken)
    }
    return response
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (response.token) {
      setAuthToken(response.token)
    }
    if (response.refreshToken) {
      setRefreshToken(response.refreshToken)
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

  forgotPassword: async (email: string) => {
    return request<{ success: boolean; message: string }>(
      '/auth/forgot-password',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      },
    )
  },

  resetPassword: async (token: string, password: string) => {
    return request<{ success: boolean; message: string }>(
      '/auth/reset-password',
      {
        method: 'POST',
        body: JSON.stringify({ token, password }),
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

  completeInvestment: async (
    id: string,
  ): Promise<{ success: boolean; message: string }> => {
    return request<{ success: boolean; message: string }>(
      `/investments/${id}/complete`,
      {
        method: 'POST',
      },
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

  getDashboardStats: async (): Promise<{
    success: boolean
    stats: {
      totalInvested: number
      activeProjects: number
      roiEarned: number
    }
  }> => {
    return request('/users/dashboard-stats')
  },

  promoteUser: async (
    id: string,
  ): Promise<{ success: boolean; message: string; user: object }> => {
    return request<{ success: boolean; message: string; user: object }>(
      `/users/${id}/promote`,
      {
        method: 'PATCH',
      },
    )
  },

  demoteUser: async (
    id: string,
  ): Promise<{ success: boolean; message: string; user: object }> => {
    return request<{ success: boolean; message: string; user: object }>(
      `/users/${id}/demote`,
      {
        method: 'PATCH',
      },
    )
  },
}

// KYC API
export const kycApi = {
  // Investor
  getMyKyc: async (): Promise<KycMyResponse> => {
    return request<KycMyResponse>('/kyc/me')
  },

  submit: async (data: KycSubmitRequest): Promise<KycSubmitResponse> => {
    return request<KycSubmitResponse>('/kyc/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  resubmit: async (data: KycSubmitRequest): Promise<KycSubmitResponse> => {
    return request<KycSubmitResponse>('/kyc/resubmit', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Admin
  getAll: async (status?: string): Promise<KycListResponse> => {
    const query = status ? `?status=${status}` : ''
    return request<KycListResponse>(`/kyc${query}`)
  },

  getById: async (id: string): Promise<KycDetailResponse> => {
    return request<KycDetailResponse>(`/kyc/${id}`)
  },

  approve: async (id: string): Promise<KycReviewResponse> => {
    return request<KycReviewResponse>(`/kyc/${id}/approve`, {
      method: 'PATCH',
    })
  },

  reject: async (id: string, reason: string): Promise<KycReviewResponse> => {
    return request<KycReviewResponse>(`/kyc/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    })
  },
}

// Activities API
export const activitiesApi = {
  getAll: async (
    params: { page?: number; limit?: number; type?: string } = {},
  ): Promise<ActivitiesListResponse> => {
    const searchParams = new URLSearchParams()
    if (params.page) searchParams.set('page', String(params.page))
    if (params.limit) searchParams.set('limit', String(params.limit))
    if (params.type) searchParams.set('type', params.type)
    const query = searchParams.toString()
    return request<ActivitiesListResponse>(
      `/activities${query ? `?${query}` : ''}`,
    )
  },
}
