import { createBuilder } from '@ibnlanre/builder'
import type {
  CreateFarmRequest,
  InvestRequest,
  LoginRequest,
  RegisterRequest,
} from '@/types'
import { authApi, farmsApi, investmentsApi, usersApi } from '@/lib/api-client'
import { watchlistApi } from '@/api/watchlist'

export const api = createBuilder({
  auth: {
    me: () => authApi.getMe(),
    login: (credentials: LoginRequest) => authApi.login(credentials),
    register: (data: RegisterRequest) => authApi.register(data),
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
})
