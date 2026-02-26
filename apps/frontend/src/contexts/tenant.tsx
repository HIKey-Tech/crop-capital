import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import type { TenantBootstrap } from '@/types'
import { tenantApi } from '@/lib/api-client'

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
  primaryColor?: string
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

const TenantContext = createContext<TenantContextValue | null>(null)

function parseHexToHslTriplet(hex: string): string | null {
  const normalizedHex = hex.trim().replace('#', '')
  if (!/^[a-fA-F0-9]{6}$/.test(normalizedHex)) return null

  const red = parseInt(normalizedHex.substring(0, 2), 16) / 255
  const green = parseInt(normalizedHex.substring(2, 4), 16) / 255
  const blue = parseInt(normalizedHex.substring(4, 6), 16) / 255

  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min

  let hue = 0
  if (delta !== 0) {
    if (max === red) hue = ((green - blue) / delta) % 6
    else if (max === green) hue = (blue - red) / delta + 2
    else hue = (red - green) / delta + 4
  }

  hue = Math.round(hue * 60)
  if (hue < 0) hue += 360

  const lightness = (max + min) / 2
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1))

  return `${hue} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%`
}

function normalizePrimaryColor(color?: string): string | null {
  if (!color) return null

  const value = color.trim()
  if (!value) return null

  const hslTripletPattern =
    /^\d{1,3}(?:\.\d+)?\s+\d{1,3}(?:\.\d+)?%\s+\d{1,3}(?:\.\d+)?%$/

  if (hslTripletPattern.test(value)) {
    return value
  }

  return parseHexToHslTriplet(value)
}

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
    primaryColor: branding.primaryColor,
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
      ...(tenant.features || {}),
    },
  }
}

function applyTenantTheme(tenant: TenantConfig) {
  const root = document.documentElement

  const normalizedPrimary = normalizePrimaryColor(tenant.primaryColor)
  if (normalizedPrimary) {
    root.style.setProperty('--primary', normalizedPrimary)
    root.style.setProperty('--ring', normalizedPrimary)
    root.style.setProperty('--sidebar-primary', normalizedPrimary)
  }

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
  const [tenant, setTenant] = useState<TenantConfig>(defaultTenantConfig)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadTenant = async () => {
      try {
        const response = await tenantApi.bootstrap()
        if (!mounted) return
        setTenant(toTenantConfig(response.tenant))
      } catch {
        if (!mounted) return
        setTenant(defaultTenantConfig)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadTenant()

    return () => {
      mounted = false
    }
  }, [])

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
