import { createBuilder } from '@ibnlanre/builder'
import type {
  ActivateAdminRequest,
  AccountResolutionResponse,
  AddFarmUpdateRequest,
  BanksListResponse,
  CountriesListResponse,
  CreateFarmMultipartRequest,
  InvestRequest,
  InviteAdminRequest,
  KycSubmitRequest,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
} from '@/types'
import {
  activitiesApi,
  authApi,
  farmsApi,
  investmentsApi,
  kycApi,
  paymentsApi,
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
    activateAdmin: (data: ActivateAdminRequest) =>
      authApi.activateAdmin(data.token, data.name, data.password),
    updateProfile: (data: UpdateProfileRequest) => authApi.updateProfile(data),
    updatePassword: (data: { currentPassword: string; newPassword: string }) =>
      authApi.updatePassword(data),
  },
  payments: {
    countries: (): Promise<CountriesListResponse> => paymentsApi.getCountries(),
    banks: (country: string): Promise<BanksListResponse> =>
      paymentsApi.getBanks(country),
    resolveAccount: (
      bankCode: string,
      accountNumber: string,
    ): Promise<AccountResolutionResponse> =>
      paymentsApi.resolveAccount(bankCode, accountNumber),
  },
  farms: {
    list: () => farmsApi.getAll(),
    detail: (id: string) => farmsApi.getById(id),
    create: (data: CreateFarmMultipartRequest) => farmsApi.create(data),
    update: (id: string, data: Parameters<typeof farmsApi.update>[1]) =>
      farmsApi.update(id, data),
    delete: (id: string) => farmsApi.delete(id),
    addUpdate: (id: string, update: AddFarmUpdateRequest) =>
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
    delete: (id: string) => tenantApi.delete(id),
    inviteAdmin: ({ id, email }: InviteAdminRequest & { id: string }) =>
      tenantApi.inviteAdmin(id, email),
  },
})
