import { useQuery } from '@tanstack/react-query'
import { createContext, useContext, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'

import type { TenantBootstrap } from '@/types'
import { api } from '@/lib/api-builder'

interface TenantFeatures {
  investments: boolean
  wallet: boolean
  transactions: boolean
  farms: boolean
  news: boolean
  notifications: boolean
  adminPortal: boolean
  adminFarms: boolean
  adminInvestors: boolean
  adminTransactions: boolean
  adminPayouts: boolean
  adminKyc: boolean
  adminReports: boolean
}

interface TenantConfig {
  id: string
  slug: string
  displayName: string
  shortName: string
  legalName: string
  logoUrl?: string
  faviconUrl?: string
  primaryHue?: number
  tagline: string
  heroTitle: string
  heroDescription: string
  ctaPrimaryLabel: string
  ctaSecondaryLabel: string
  supportEmail: string
  supportPhone: string
  supportWhatsapp?: string
  address?: string
  websiteUrl?: string
  termsUrl?: string
  privacyUrl?: string
  features: TenantFeatures
}

interface TenantContextValue {
  tenant: TenantConfig
  loading: boolean
}

const defaultTenantConfig: TenantConfig = {
  id: 'default',
  slug: 'default',
  displayName: 'CropCapital',
  shortName: 'CC',
  legalName: 'CropCapital',
  tagline:
    'Empowering African agriculture through community-driven investments.',
  heroTitle: 'Invest in African Agriculture',
  heroDescription:
    'Connect with verified farms across Liberia and West Africa. Earn attractive returns while empowering local communities.',
  ctaPrimaryLabel: 'Start Investing',
  ctaSecondaryLabel: 'Explore Farms',
  supportEmail: 'support@cropcapital.com',
  supportPhone: '+234 800 123 4567',
  features: {
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
  },
}

const DEFAULT_PRIMARY_HUE = 142

const TenantContext = createContext<TenantContextValue | null>(null)

function toTenantConfig(tenant?: TenantBootstrap | null): TenantConfig {
  if (!tenant) return defaultTenantConfig

  const branding = tenant.branding

  return {
    id: tenant.id,
    slug: tenant.slug,
    displayName: branding.displayName || defaultTenantConfig.displayName,
    shortName: branding.shortName || defaultTenantConfig.shortName,
    legalName:
      branding.legalName ||
      branding.displayName ||
      defaultTenantConfig.legalName,
    logoUrl: branding.logoUrl,
    faviconUrl: branding.faviconUrl,
    primaryHue: branding.primaryHue,
    tagline: branding.tagline || defaultTenantConfig.tagline,
    heroTitle: branding.heroTitle || defaultTenantConfig.heroTitle,
    heroDescription:
      branding.heroDescription || defaultTenantConfig.heroDescription,
    ctaPrimaryLabel:
      branding.ctaPrimaryLabel || defaultTenantConfig.ctaPrimaryLabel,
    ctaSecondaryLabel:
      branding.ctaSecondaryLabel || defaultTenantConfig.ctaSecondaryLabel,
    supportEmail: branding.supportEmail || defaultTenantConfig.supportEmail,
    supportPhone: branding.supportPhone || defaultTenantConfig.supportPhone,
    supportWhatsapp: branding.supportWhatsapp,
    address: branding.address,
    websiteUrl: branding.websiteUrl,
    termsUrl: branding.termsUrl,
    privacyUrl: branding.privacyUrl,
    features: {
      ...defaultTenantConfig.features,
      ...tenant.features,
    },
  }
}

function applyTenantTheme(tenant: TenantConfig) {
  const root = document.documentElement

  root.style.setProperty(
    '--hue-primary',
    String(tenant.primaryHue ?? DEFAULT_PRIMARY_HUE),
  )

  document.title = `${tenant.displayName} - Agricultural Investment Platform`

  if (tenant.faviconUrl) {
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']")

    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }

    link.href = tenant.faviconUrl
  }
}

export function TenantProvider({ children }: { children: ReactNode }) {
  const tenantQuery = useQuery({
    queryKey: api.tenants.bootstrap.$use(),
    queryFn: () => api.$use.tenants.bootstrap(),
    retry: false,
  })

  const tenant = useMemo(
    () => toTenantConfig(tenantQuery.data?.tenant),
    [tenantQuery.data?.tenant],
  )
  const loading = tenantQuery.isLoading

  useEffect(() => {
    applyTenantTheme(tenant)
  }, [tenant])

  const value = useMemo(() => ({ tenant, loading }), [tenant, loading])

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider')
  }

  return context
}
