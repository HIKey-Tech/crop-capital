import { createBuilder } from '@ibnlanre/builder'
import type {
  CreateFarmRequest,
  InvestRequest,
  KycSubmitRequest,
  LoginRequest,
  RegisterRequest,
} from '@/types'
import {
  activitiesApi,
  authApi,
  farmsApi,
  investmentsApi,
  kycApi,
  tenantApi,
  usersApi,
} from '@/lib/api-client'
import { watchlistApi } from '@/api/watchlist'

export const api = createBuilder({
  auth: {
    me: () => authApi.getMe(),
    login: (credentials: LoginRequest) => authApi.login(credentials),
    register: (data: RegisterRequest) => authApi.register(data),
    forgotPassword: (email: string) => authApi.forgotPassword(email),
    resetPassword: ({ token, password }: { token: string; password: string }) =>
      authApi.resetPassword(token, password),
    updateProfile: (data: {
      name?: string
      country?: string
      photo?: string
    }) => authApi.updateProfile(data),
    updatePassword: (data: { currentPassword: string; newPassword: string }) =>
      authApi.updatePassword(data),
  },
  farms: {
    list: () => farmsApi.getAll(),
    detail: (id: string) => farmsApi.getById(id),
    create: (data: CreateFarmRequest) => farmsApi.create(data),
    update: (id: string, data: Partial<CreateFarmRequest>) =>
      farmsApi.update(id, data),
    delete: (id: string) => farmsApi.delete(id),
    addUpdate: (id: string, update: { stage: string; image?: string }) =>
      farmsApi.addUpdate(id, update),
  },
  investments: {
    mine: () => investmentsApi.getMyInvestments(),
    all: () => investmentsApi.getAllInvestments(),
    detail: (id: string) => investmentsApi.getById(id),
    invest: (data: InvestRequest) => investmentsApi.invest(data),
    verifyPayment: (reference: string) =>
      investmentsApi.verifyPayment(reference),
  },
  users: {
    list: () => usersApi.getAll(),
    detail: (id: string) => usersApi.getById(id),
    stats: () => usersApi.getStats(),
    dashboardStats: () => usersApi.getDashboardStats(),
    promote: (id: string) => usersApi.promoteUser(id),
    demote: (id: string) => usersApi.demoteUser(id),
  },
  watchlist: {
    list: () => watchlistApi.getWatchlist(),
    add: (farmId: string) => watchlistApi.addToWatchlist(farmId),
    remove: (farmId: string) => watchlistApi.removeFromWatchlist(farmId),
  },
  kyc: {
    me: () => kycApi.getMyKyc(),
    submit: (data: KycSubmitRequest) => kycApi.submit(data),
    resubmit: (data: KycSubmitRequest) => kycApi.resubmit(data),
    list: (status?: string) => kycApi.getAll(status),
    detail: (id: string) => kycApi.getById(id),
    approve: (id: string) => kycApi.approve(id),
    reject: (id: string, reason: string) => kycApi.reject(id, reason),
  },
  activities: {
    list: (params?: { page?: number; limit?: number; type?: string }) =>
      activitiesApi.getAll(params),
  },
  tenants: {
    bootstrap: () => tenantApi.bootstrap(),
    list: () => tenantApi.list(),
    create: (data: Parameters<typeof tenantApi.create>[0]) =>
      tenantApi.create(data),
    update: ({
      id,
      data,
    }: {
      id: string
      data: Parameters<typeof tenantApi.update>[1]
    }) => tenantApi.update(id, data),
    assignUnassignedUsers: (id: string) => tenantApi.assignUnassignedUsers(id),
  },
})
