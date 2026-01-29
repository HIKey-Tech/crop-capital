// API Types - matching backend models

export interface User {
  _id: string
  name: string
  email: string
  role: 'investor' | 'admin'
  country?: string
  photo?: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface Farm {
  _id: string
  name: string
  location: string
  image: string
  investmentGoal: number
  minimumInvestment: number
  roi: number
  durationMonths: number
  fundedAmount: number
  updates: Array<FarmUpdate>
  createdAt: string
  updatedAt: string
}

export interface FarmUpdate {
  stage: string
  image?: string
  date: string
}

export interface Investment {
  _id: string
  investor: string | User
  farm: string | Farm
  amount: number
  roi: number
  durationMonths: number
  roiPaid: boolean
  paystackReference?: string
  paystackAccessCode?: string
  status: 'pending' | 'completed' | 'cancelled'
  projectedReturn: number
  createdAt: string
  updatedAt: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export interface AuthResponse {
  success: boolean
  token: string
  user: User
}

export interface InvestmentResponse {
  success: boolean
  message: string
  authorizationUrl: string
  accessCode: string
  reference: string
  investmentId: string
}

export interface InvestmentsListResponse {
  success: boolean
  investments: Array<Investment>
}

export interface FarmsListResponse {
  success: boolean
  farms: Array<Farm>
}

export interface FarmResponse {
  success: boolean
  farm: Farm
}

// Request types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  country?: string
}

export interface InvestRequest {
  farmId: string
  amount: number
}

export interface CreateFarmRequest {
  name: string
  location: string
  image: string
  investmentGoal: number
  minimumInvestment: number
  roi: number
  durationMonths: number
}

// User with stats (for admin)
export interface UserWithStats {
  _id: string
  name: string
  email: string
  country?: string
  isVerified: boolean
  createdAt: string
  totalInvested: number
  activeProjects: number
}

export interface UsersListResponse {
  success: boolean
  count: number
  users: Array<UserWithStats>
}

export interface UserStatsResponse {
  success: boolean
  stats: {
    totalUsers: number
    verifiedUsers: number
    totalVolume: number
    activeInvestors: number
  }
}
