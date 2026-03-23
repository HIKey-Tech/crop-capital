import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import type { TenantFeatures, TenantSummary } from '@/types'
import { api } from '@/lib/api-builder'

export const defaultTenantFeatures: TenantFeatures = {
  investments: true,
  wallet: true,
  transactions: true,
  farms: true,
  news: true,
  notifications: true,
  adminPortal: true,
  adminFarms: true,
  adminInvestors: true,
  adminTransactions: true,
  adminPayouts: true,
  adminKyc: true,
  adminReports: true,
}

export const featureLabels: Array<{
  key: keyof TenantFeatures
  label: string
}> = [
  { key: 'investments', label: 'Investments' },
  { key: 'wallet', label: 'Wallet' },
  { key: 'transactions', label: 'Transactions' },
  { key: 'farms', label: 'Farms' },
  { key: 'news', label: 'News' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'adminPortal', label: 'Admin Portal' },
  { key: 'adminFarms', label: 'Admin Farms' },
  { key: 'adminInvestors', label: 'Admin Investors' },
  { key: 'adminTransactions', label: 'Admin Transactions' },
  { key: 'adminPayouts', label: 'Admin Payouts' },
  { key: 'adminKyc', label: 'Admin KYC' },
  { key: 'adminReports', label: 'Admin Reports' },
]

export type TenantReadinessStatus =
  | 'launch-ready'
  | 'demo-ready'
  | 'needs-attention'

const tenantReadinessAppearance: Record<
  TenantReadinessStatus,
  {
    label: string
    badgeClassName: string
    meterClassName: string
    summaryCardClassName: string
    summaryLabelClassName: string
    summaryValueClassName: string
  }
> = {
  'launch-ready': {
    label: 'Launch Ready',
    badgeClassName: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    meterClassName: 'bg-emerald-500',
    summaryCardClassName:
      'rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 shadow-sm',
    summaryLabelClassName: 'text-xs uppercase tracking-wide text-emerald-700',
    summaryValueClassName: 'mt-2 text-2xl font-semibold text-emerald-900',
  },
  'demo-ready': {
    label: 'Demo Ready',
    badgeClassName: 'border-sky-200 bg-sky-50 text-sky-800',
    meterClassName: 'bg-sky-500',
    summaryCardClassName:
      'rounded-2xl border border-sky-200 bg-sky-50/80 p-4 shadow-sm',
    summaryLabelClassName: 'text-xs uppercase tracking-wide text-sky-700',
    summaryValueClassName: 'mt-2 text-2xl font-semibold text-sky-900',
  },
  'needs-attention': {
    label: 'Needs Attention',
    badgeClassName: 'border-amber-200 bg-amber-50 text-amber-900',
    meterClassName: 'bg-amber-500',
    summaryCardClassName:
      'rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm',
    summaryLabelClassName: 'text-xs uppercase tracking-wide text-amber-700',
    summaryValueClassName: 'mt-2 text-2xl font-semibold text-amber-900',
  },
}

export const getTenantReadinessAppearance = (status: TenantReadinessStatus) =>
  tenantReadinessAppearance[status]

export const getTenantActivationBadgeClassName = (isActive: boolean) =>
  isActive ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : ''

export const getBrowserOrigin = () => {
  if (typeof window === 'undefined') return ''
  return window.location.origin.replace(/\/$/, '')
}

export const getTenantAccessUrls = (tenant: TenantSummary, origin: string) => {
  const primaryDomain = tenant.domains[0]
  const preferredBaseUrl = primaryDomain
    ? `https://${primaryDomain}`
    : `${origin}/${tenant.slug}`

  return {
    preferredBaseUrl,
    investorSignInUrl: `${preferredBaseUrl}/auth/sign-in`,
    tenantDashboardUrl: `${preferredBaseUrl}/dashboard`,
    localDemoBaseUrl: `${origin}/${tenant.slug}`,
  }
}

export const getTenantReadiness = (tenant: TenantSummary) => {
  const checks = [
    {
      key: 'active',
      label: 'Tenant is active',
      passed: tenant.isActive,
    },
    {
      key: 'domain',
      label: 'Custom domain configured',
      passed: tenant.domains.length > 0,
    },
    {
      key: 'support',
      label: 'Support contact configured',
      passed: Boolean(
        tenant.branding.supportEmail?.trim() ||
        tenant.branding.supportPhone?.trim(),
      ),
    },
    {
      key: 'branding',
      label: 'Launch copy is populated',
      passed: Boolean(
        tenant.branding.displayName.trim() &&
        tenant.branding.tagline?.trim() &&
        tenant.branding.heroTitle?.trim(),
      ),
    },
    {
      key: 'features',
      label: 'Core investor and admin features enabled',
      passed: Boolean(
        tenant.features.farms &&
        tenant.features.investments &&
        tenant.features.wallet &&
        tenant.features.transactions &&
        tenant.features.adminPortal,
      ),
    },
  ]

  const passedChecks = checks.filter((check) => check.passed).length
  const blockers = checks
    .filter((check) => !check.passed)
    .map((check) => check.label)

  const status =
    blockers.length === 0
      ? 'launch-ready'
      : blockers.length === 1 && blockers[0] === 'Custom domain configured'
        ? 'demo-ready'
        : 'needs-attention'

  return {
    score: `${passedChecks}/${checks.length}`,
    status: status as TenantReadinessStatus,
    blockers,
  }
}

export function useTenants() {
  const tenantsQuery = useQuery({
    queryKey: api.tenants.list.$use(),
    queryFn: () => api.$use.tenants.list(),
  })

  const sortedTenants = useMemo(
    () =>
      [...(tenantsQuery.data?.tenants || [])].sort((first, second) =>
        first.slug.localeCompare(second.slug),
      ),
    [tenantsQuery.data?.tenants],
  )

  const tenantStats = useMemo(
    () => ({
      total: sortedTenants.length,
      active: sortedTenants.filter((t) => t.isActive).length,
      inactive: sortedTenants.filter((t) => !t.isActive).length,
      withDomains: sortedTenants.filter((t) => t.domains.length > 0).length,
    }),
    [sortedTenants],
  )

  return { tenantsQuery, sortedTenants, tenantStats }
}
