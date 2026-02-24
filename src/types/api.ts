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
  coordinates?: {
    latitude: number
    longitude: number
  }
  images: Array<string>
  imagePublicIds: Array<string>
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
  imagePublicId?: string
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

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export interface AuthResponse {
  success: boolean
  token: string
  refreshToken: string
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

export interface InvestmentDetailResponse {
  success: boolean
  investment: Investment
}

export interface FarmsListResponse {
  success: boolean
  farms: Array<Farm>
}

export interface FarmResponse {
  success: boolean
  farm: Farm
}

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
  coordinates?: {
    latitude: number
    longitude: number
  }
  images: Array<string>
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

export interface UserDetailResponse {
  success: boolean
  user: UserWithStats & {
    photo?: string
    role: string
    activeInvestments: number
  }
  investments: Array<Investment>
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

// KYC types
export type KycDocumentType = 'passport' | 'national_id' | 'drivers_license'
export type KycStatus = 'pending' | 'approved' | 'rejected'

export interface KycSubmission {
  _id: string
  user: string | Pick<User, '_id' | 'name' | 'email' | 'country' | 'photo'>
  documentType: KycDocumentType
  documentImage: string
  selfieImage?: string
  status: KycStatus
  rejectionReason?: string
  reviewedBy?: Pick<User, '_id' | 'name' | 'email'>
  reviewedAt?: string
  createdAt: string
  updatedAt: string
}

export interface KycMyResponse {
  success: boolean
  kyc: KycSubmission | null
}

export interface KycSubmitResponse {
  success: boolean
  message: string
  kyc: Pick<KycSubmission, '_id' | 'documentType' | 'status' | 'createdAt'>
}

export interface KycListResponse {
  success: boolean
  stats: {
    pending: number
    approved: number
    rejected: number
    total: number
  }
  submissions: Array<KycSubmission>
}

export interface KycDetailResponse {
  success: boolean
  kyc: KycSubmission
}

export interface KycReviewResponse {
  success: boolean
  message: string
  kyc: Pick<KycSubmission, '_id' | 'status' | 'rejectionReason' | 'reviewedAt'>
}

export interface KycSubmitRequest {
  documentType: KycDocumentType
  documentImage: string
  selfieImage?: string
}

// Activity types
export type ActivityType =
  | 'user_signup'
  | 'farm_created'
  | 'farm_updated'
  | 'farm_deleted'
  | 'investment_created'
  | 'investment_completed'
  | 'investment_failed'
  | 'kyc_submitted'
  | 'kyc_approved'
  | 'kyc_rejected'
  | 'roi_paid'

export interface Activity {
  _id: string
  type: ActivityType
  title: string
  description: string
  actor?: Pick<User, '_id' | 'name' | 'email' | 'photo'>
  resourceId?: string
  resourceType?: 'Farm' | 'Investment' | 'User' | 'KycDocument'
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface ActivitiesListResponse {
  success: boolean
  activities: Array<Activity>
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
