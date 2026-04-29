export type CurrencyCode = 'NGN' | 'USD' | 'GHS' | 'KES'

export interface BankAccountDetails {
  accountName: string
  bankName: string
  bankCode?: string
  accountNumber: string
}

export interface UpdateProfileRequest {
  name?: string
  country?: string
  photo?: File | null
  removePhoto?: boolean
  bankAccount?: {
    accountName?: string
    bankName?: string
    bankCode?: string
    accountNumber?: string
  }
  onboarding?: {
    goal?: 'income' | 'growth' | 'balanced'
    experience?: 'first-time' | 'some-experience' | 'advanced'
    termsAccepted?: boolean
    completedAt?: string
  }
}

export interface PaystackBank {
  id: number
  name: string
  code: string
  longcode?: string
  currency?: string
  country?: string
}

export interface PaystackCountry {
  id: number
  name: string
  isoCode: string
  defaultCurrencyCode: string
}

export interface BanksListResponse {
  success: boolean
  supported: boolean
  banks: Array<PaystackBank>
}

export interface CountriesListResponse {
  success: boolean
  countries: Array<PaystackCountry>
}

export interface AccountResolutionResponse {
  success: boolean
  resolved: boolean
  accountName: string | null
  accountNumber: string | null
}

export interface User {
  _id: string
  name: string
  email: string
  role: 'investor' | 'admin' | 'super_admin'
  country?: string
  photo?: string
  bankAccount?: BankAccountDetails
  onboarding?: {
    goal?: 'income' | 'growth' | 'balanced'
    experience?: 'first-time' | 'some-experience' | 'advanced'
    termsAccepted?: boolean
    completedAt?: string
  }
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface Farm {
  _id: string
  name: string
  location: string
  currency: CurrencyCode
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

export type CommodityOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'fulfilled'
  | 'cancelled'

export interface Commodity {
  _id: string
  name: string
  category: string
  description?: string
  location: string
  currency: CurrencyCode
  price: number
  unit: string
  availableQuantity: number
  minimumOrderQuantity: number
  images: Array<string>
  imagePublicIds: Array<string>
  isFeatured: boolean
  isPublished: boolean
  soldQuantity: number
  createdAt: string
  updatedAt: string
}

export interface CommodityOrderItem {
  commodity: string
  name: string
  unit: string
  image?: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface CommodityOrder {
  _id: string
  buyer: string | Pick<User, '_id' | 'name' | 'email' | 'photo'>
  buyerName: string
  buyerEmail: string
  contactPhone?: string
  deliveryAddress?: string
  customerNote?: string
  currency: CurrencyCode
  items: Array<CommodityOrderItem>
  subtotal: number
  status: CommodityOrderStatus
  statusNote?: string
  paystackReference?: string
  createdAt: string
  updatedAt: string
}

export interface Investment {
  _id: string
  investor: string | User
  farm: string | Farm
  amount: number
  currency: CurrencyCode
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
  currency: CurrencyCode
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

export interface CommoditiesListResponse {
  success: boolean
  commodities: Array<Commodity>
}

export interface CommodityResponse {
  success: boolean
  commodity: Commodity
}

export interface CommodityOrdersResponse {
  success: boolean
  orders: Array<CommodityOrder>
}

export interface CommodityOrderResponse {
  success: boolean
  order: CommodityOrder
  authorizationUrl?: string
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
  currency: CurrencyCode
  coordinates?: {
    latitude: number
    longitude: number
  }
  investmentGoal: number
  minimumInvestment: number
  roi: number
  durationMonths: number
}

export interface CreateFarmMultipartRequest {
  data: CreateFarmRequest
  images: Array<File>
}

export interface CreateCommodityRequest {
  name: string
  category: string
  description?: string
  location: string
  currency: CurrencyCode
  price: number
  unit: string
  availableQuantity: number
  minimumOrderQuantity: number
  isFeatured: boolean
  isPublished: boolean
}

export interface CreateCommodityMultipartRequest {
  data: CreateCommodityRequest
  images: Array<File>
}

export interface UpdateFarmRequest {
  data: Partial<CreateFarmRequest>
  hasImageChanges?: boolean
  retainedImagePublicIds?: Array<string>
  newImages?: Array<File>
}

export interface UpdateCommodityRequest {
  data: Partial<CreateCommodityRequest>
  hasImageChanges?: boolean
  retainedImagePublicIds?: Array<string>
  newImages?: Array<File>
}

export interface CreateCommodityOrderRequest {
  items: Array<{
    listingId: string
    quantity: number
  }>
  contactPhone?: string
  deliveryAddress?: string
  customerNote?: string
}

export interface UpdateCommodityOrderStatusRequest {
  status: CommodityOrderStatus
  statusNote?: string
}

export interface AddFarmUpdateRequest {
  stage: string
  image?: File | null
}

// User with stats (for admin)
export interface UserWithStats {
  _id: string
  name: string
  email: string
  role: 'investor' | 'admin' | 'super_admin'
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
  documentImage: File
  selfieImage?: File
}

// Activity types
export type ActivityType =
  | 'user_signup'
  | 'tenant_created'
  | 'tenant_updated'
  | 'tenant_deleted'
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
  | 'user_promoted_to_admin'
  | 'user_demoted_to_investor'

export interface Activity {
  _id: string
  type: ActivityType
  title: string
  description: string
  actor?: Pick<User, '_id' | 'name' | 'email' | 'photo'>
  resourceId?: string
  resourceType?: 'Farm' | 'Investment' | 'User' | 'KycDocument' | 'Tenant'
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

export interface TenantBranding {
  displayName: string
  shortName?: string
  legalName?: string
  logoUrl?: string
  faviconUrl?: string
  primaryHue?: number
  tagline?: string
  heroTitle?: string
  heroDescription?: string
  ctaPrimaryLabel?: string
  ctaSecondaryLabel?: string
  supportEmail?: string
  supportPhone?: string
  supportWhatsapp?: string
  address?: string
  websiteUrl?: string
  termsUrl?: string
  privacyUrl?: string
}

export interface TenantFeatures {
  investments: boolean
  wallet: boolean
  transactions: boolean
  farms: boolean
  marketplace: boolean
  news: boolean
  notifications: boolean
  adminPortal: boolean
  adminFarms: boolean
  adminMarketplace: boolean
  adminInvestors: boolean
  adminTransactions: boolean
  adminPayouts: boolean
  adminKyc: boolean
  adminReports: boolean
}

export interface TenantBootstrap {
  id: string
  name: string
  slug: string
  features: TenantFeatures
  branding: TenantBranding
}

export interface TenantBootstrapResponse {
  success: boolean
  tenant: TenantBootstrap | null
}

export interface TenantSummary extends TenantBootstrap {
  domains: Array<string>
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface TenantsListResponse {
  success: boolean
  count: number
  tenants: Array<TenantSummary>
}

export interface CreateTenantRequest {
  name: string
  slug: string
  domains?: Array<string>
  isActive?: boolean
  branding: TenantBranding
  features?: TenantFeatures
}

export interface UpdateTenantRequest {
  name?: string
  slug?: string
  domains?: Array<string>
  isActive?: boolean
  branding?: TenantBranding
  features?: TenantFeatures
}

export interface TenantMutationResponse {
  success: boolean
  tenant: TenantSummary
}

export interface DeleteTenantResponse {
  success: boolean
  message: string
  cleanup: {
    tenantId: string
    tenantSlug: string
    usersDeleted: number
    farmsDeleted: number
    commoditiesDeleted: number
    commodityOrdersDeleted: number
    investmentsDeleted: number
    kycDocumentsDeleted: number
    activitiesDeleted: number
    webhookEventsDeleted: number
    farmImagesDeleted: number
    farmImagesFailed: number
    commodityImagesDeleted: number
    commodityImagesFailed: number
    kycImagesDeleted: number
    kycImagesFailed: number
  }
}

export interface AssignUsersResponse {
  success: boolean
  message: string
  updatedCount: number
}

export interface InviteAdminRequest {
  email: string
}

export interface InviteAdminResponse {
  success: boolean
  message: string
}

export interface ActivateAdminRequest {
  token: string
  name: string
  password: string
}

export interface ActivateAdminResponse {
  success: boolean
  token: string
  refreshToken: string
  user: User
}
