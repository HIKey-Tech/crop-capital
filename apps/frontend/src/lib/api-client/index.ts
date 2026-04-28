import type {
  AccountResolutionResponse,
  ActivateAdminResponse,
  ActivitiesListResponse,
  AddFarmUpdateRequest,
  AuthResponse,
  BanksListResponse,
  CommoditiesListResponse,
  CommodityOrderResponse,
  CommodityOrdersResponse,
  CommodityResponse,
  CountriesListResponse,
  CreateCommodityMultipartRequest,
  CreateCommodityOrderRequest,
  CreateCommodityRequest,
  CreateFarmMultipartRequest,
  CreateFarmRequest,
  CreateTenantRequest,
  DeleteTenantResponse,
  FarmResponse,
  FarmsListResponse,
  InvestRequest,
  InvestmentDetailResponse,
  InvestmentResponse,
  InvestmentsListResponse,
  InviteAdminResponse,
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
  UpdateCommodityOrderStatusRequest,
  UpdateCommodityRequest,
  UpdateFarmRequest,
  UpdateProfileRequest,
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
  const platformRoot = import.meta.env.VITE_PLATFORM_ROOT_DOMAIN

  if (!platformRoot) return null

  if (!host.endsWith(platformRoot.toLowerCase())) return null

  const suffix = `.${platformRoot.toLowerCase()}`
  if (!host.endsWith(suffix)) return null

  const prefix = host.slice(0, -suffix.length)
  if (!prefix) return null

  const parts = prefix.split('.').filter(Boolean)
  return parts.length ? parts[parts.length - 1] : null
}

function resolveTenantSlugFromPath(): string | null {
  if (typeof window === 'undefined') return null

  const [firstSegment] = window.location.pathname.split('/').filter(Boolean)

  if (!firstSegment) return null

  const reservedSegments = new Set(['auth', 'super-admin'])
  if (reservedSegments.has(firstSegment.toLowerCase())) {
    return null
  }

  return firstSegment.toLowerCase()
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthToken()
  const isFormDataBody =
    typeof FormData !== 'undefined' && options.body instanceof FormData

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  }

  if (!isFormDataBody && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const tenantSlug = resolveTenantSlugFromHost() || resolveTenantSlugFromPath()
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

function appendFarmFields(
  formData: FormData,
  data: Partial<CreateFarmRequest>,
) {
  if (data.name != null) formData.append('name', data.name)
  if (data.location != null) formData.append('location', data.location)
  if (data.currency != null) formData.append('currency', data.currency)
  if (data.investmentGoal != null) {
    formData.append('investmentGoal', String(data.investmentGoal))
  }
  if (data.minimumInvestment != null) {
    formData.append('minimumInvestment', String(data.minimumInvestment))
  }
  if (data.roi != null) formData.append('roi', String(data.roi))
  if (data.durationMonths != null) {
    formData.append('durationMonths', String(data.durationMonths))
  }
  if (data.coordinates?.latitude != null) {
    formData.append('latitude', String(data.coordinates.latitude))
  }
  if (data.coordinates?.longitude != null) {
    formData.append('longitude', String(data.coordinates.longitude))
  }
}

function appendCommodityFields(
  formData: FormData,
  data: Partial<CreateCommodityRequest>,
) {
  if (data.name != null) formData.append('name', data.name)
  if (data.category != null) formData.append('category', data.category)
  if (data.description != null) formData.append('description', data.description)
  if (data.location != null) formData.append('location', data.location)
  if (data.currency != null) formData.append('currency', data.currency)
  if (data.price != null) formData.append('price', String(data.price))
  if (data.unit != null) formData.append('unit', data.unit)
  if (data.availableQuantity != null) {
    formData.append('availableQuantity', String(data.availableQuantity))
  }
  if (data.minimumOrderQuantity != null) {
    formData.append('minimumOrderQuantity', String(data.minimumOrderQuantity))
  }
  if (data.isFeatured != null) {
    formData.append('isFeatured', String(data.isFeatured))
  }
  if (data.isPublished != null) {
    formData.append('isPublished', String(data.isPublished))
  }
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
  delete: async (id: string): Promise<DeleteTenantResponse> => {
    return request<DeleteTenantResponse>(`/tenants/${id}`, {
      method: 'DELETE',
    })
  },

  inviteAdmin: async (
    id: string,
    email: string,
  ): Promise<InviteAdminResponse> => {
    return request<InviteAdminResponse>(`/tenants/${id}/invite-admin`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
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

  updateProfile: async (data: UpdateProfileRequest) => {
    const formData = new FormData()
    if (data.name != null) formData.append('name', data.name)
    if (data.country != null) formData.append('country', data.country)
    if (data.photo instanceof File) {
      formData.append('photo', data.photo)
    }
    if (data.removePhoto) {
      formData.append('removePhoto', 'true')
    }
    if (data.bankAccount) {
      if (data.bankAccount.accountName != null) {
        formData.append('bankAccount.accountName', data.bankAccount.accountName)
      }
      if (data.bankAccount.bankName != null) {
        formData.append('bankAccount.bankName', data.bankAccount.bankName)
      }
      if (data.bankAccount.bankCode != null) {
        formData.append('bankAccount.bankCode', data.bankAccount.bankCode)
      }
      if (data.bankAccount.accountNumber != null) {
        formData.append(
          'bankAccount.accountNumber',
          data.bankAccount.accountNumber,
        )
      }
    }
    if (data.onboarding) {
      if (data.onboarding.goal != null) {
        formData.append('onboarding.goal', data.onboarding.goal)
      }
      if (data.onboarding.experience != null) {
        formData.append('onboarding.experience', data.onboarding.experience)
      }
      if (data.onboarding.termsAccepted != null) {
        formData.append(
          'onboarding.termsAccepted',
          String(data.onboarding.termsAccepted),
        )
      }
      if (data.onboarding.completedAt != null) {
        formData.append('onboarding.completedAt', data.onboarding.completedAt)
      }
    }

    return request<{
      success: boolean
      message: string
      user: AuthResponse['user']
    }>('/auth/update-profile', {
      method: 'PATCH',
      body: formData,
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

  activateAdmin: async (
    token: string,
    name: string,
    password: string,
  ): Promise<ActivateAdminResponse> => {
    const response = await request<ActivateAdminResponse>('/auth/activate', {
      method: 'POST',
      body: JSON.stringify({ token, name, password }),
    })
    if (response.token) {
      setAuthToken(response.token)
    }
    if (response.refreshToken) {
      setRefreshToken(response.refreshToken)
    }
    return response
  },
}

export const paymentsApi = {
  getCountries: async (): Promise<CountriesListResponse> => {
    return request<CountriesListResponse>('/payments/countries')
  },

  getBanks: async (country: string): Promise<BanksListResponse> => {
    const searchParams = new URLSearchParams({ country })
    return request<BanksListResponse>(
      `/payments/banks?${searchParams.toString()}`,
    )
  },

  resolveAccount: async (
    bankCode: string,
    accountNumber: string,
  ): Promise<AccountResolutionResponse> => {
    const searchParams = new URLSearchParams({ bankCode, accountNumber })
    return request<AccountResolutionResponse>(
      `/payments/resolve-account?${searchParams.toString()}`,
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

  create: async (
    payload: CreateFarmMultipartRequest,
  ): Promise<FarmResponse> => {
    const formData = new FormData()
    appendFarmFields(formData, payload.data)
    payload.images.forEach((image) => {
      formData.append('images', image)
    })

    return request<FarmResponse>('/farms', {
      method: 'POST',
      body: formData,
    })
  },

  update: async (
    id: string,
    payload: UpdateFarmRequest,
  ): Promise<FarmResponse> => {
    const formData = new FormData()
    appendFarmFields(formData, payload.data)

    if (payload.hasImageChanges) {
      formData.append('hasImageChanges', 'true')
      payload.retainedImagePublicIds?.forEach((publicId) => {
        formData.append('retainedImagePublicIds', publicId)
      })
      payload.newImages?.forEach((image) => {
        formData.append('images', image)
      })
    }

    return request<FarmResponse>(`/farms/${id}`, {
      method: 'PATCH',
      body: formData,
    })
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(`/farms/${id}`, {
      method: 'DELETE',
    })
  },

  addUpdate: async (
    id: string,
    update: AddFarmUpdateRequest,
  ): Promise<FarmResponse> => {
    const formData = new FormData()
    formData.append('stage', update.stage)
    if (update.image) {
      formData.append('image', update.image)
    }

    return request<FarmResponse>(`/farms/${id}/updates`, {
      method: 'POST',
      body: formData,
    })
  },
}

export const commodityApi = {
  getAll: async (): Promise<CommoditiesListResponse> => {
    return request<CommoditiesListResponse>('/commodities')
  },

  getById: async (id: string): Promise<CommodityResponse> => {
    return request<CommodityResponse>(`/commodities/${id}`)
  },

  create: async (
    payload: CreateCommodityMultipartRequest,
  ): Promise<CommodityResponse> => {
    const formData = new FormData()
    appendCommodityFields(formData, payload.data)
    payload.images.forEach((image) => {
      formData.append('images', image)
    })

    return request<CommodityResponse>('/commodities', {
      method: 'POST',
      body: formData,
    })
  },

  update: async (
    id: string,
    payload: UpdateCommodityRequest,
  ): Promise<CommodityResponse> => {
    const formData = new FormData()
    appendCommodityFields(formData, payload.data)

    if (payload.hasImageChanges) {
      formData.append('hasImageChanges', 'true')
      payload.retainedImagePublicIds?.forEach((publicId) => {
        formData.append('retainedImagePublicIds', publicId)
      })
      payload.newImages?.forEach((image) => {
        formData.append('images', image)
      })
    }

    return request<CommodityResponse>(`/commodities/${id}`, {
      method: 'PATCH',
      body: formData,
    })
  },

  delete: async (
    id: string,
  ): Promise<{ success: boolean; message: string }> => {
    return request<{ success: boolean; message: string }>(
      `/commodities/${id}`,
      {
        method: 'DELETE',
      },
    )
  },

  placeOrder: async (
    payload: CreateCommodityOrderRequest,
  ): Promise<CommodityOrderResponse> => {
    return request<CommodityOrderResponse>('/commodities/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  getOrders: async (): Promise<CommodityOrdersResponse> => {
    return request<CommodityOrdersResponse>('/commodities/orders')
  },

  getMyOrders: async (): Promise<CommodityOrdersResponse> => {
    return request<CommodityOrdersResponse>('/commodities/orders/me')
  },

  updateOrderStatus: async (
    id: string,
    payload: UpdateCommodityOrderStatusRequest,
  ): Promise<CommodityOrderResponse> => {
    return request<CommodityOrderResponse>(`/commodities/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
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
    const formData = new FormData()
    formData.append('documentType', data.documentType)
    formData.append('documentImage', data.documentImage)
    if (data.selfieImage) {
      formData.append('selfieImage', data.selfieImage)
    }

    return request<KycSubmitResponse>('/kyc/submit', {
      method: 'POST',
      body: formData,
    })
  },

  resubmit: async (data: KycSubmitRequest): Promise<KycSubmitResponse> => {
    const formData = new FormData()
    formData.append('documentType', data.documentType)
    formData.append('documentImage', data.documentImage)
    if (data.selfieImage) {
      formData.append('selfieImage', data.selfieImage)
    }

    return request<KycSubmitResponse>('/kyc/resubmit', {
      method: 'PUT',
      body: formData,
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
