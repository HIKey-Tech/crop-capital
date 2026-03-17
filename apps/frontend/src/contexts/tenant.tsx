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
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
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

const defaultPrimaryColor = '142 64% 32%'
const defaultSecondaryColor = '352 47% 29%'
const defaultAccentColor = '43 92% 52%'
const defaultPrimaryForeground = '0 0% 100%'
const defaultGradientPrimary =
  'linear-gradient(135deg, hsl(142 64% 32%) 0%, hsl(142 64% 40%) 100%)'
const defaultGradientSecondary =
  'linear-gradient(135deg, hsl(352 47% 29%) 0%, hsl(352 43% 37%) 100%)'

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

interface HslColor {
  hue: number
  saturation: number
  lightness: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function parseHslTriplet(color: string): HslColor | null {
  const match = color.match(
    /^(\d{1,3}(?:\.\d+)?)\s+(\d{1,3}(?:\.\d+)?)%\s+(\d{1,3}(?:\.\d+)?)%$/,
  )

  if (!match) return null

  return {
    hue: Number(match[1]),
    saturation: Number(match[2]),
    lightness: Number(match[3]),
  }
}

function formatHslTriplet(color: HslColor) {
  return `${Math.round(color.hue)} ${Math.round(color.saturation)}% ${Math.round(color.lightness)}%`
}

function normalizeThemeColor(color?: string): string | null {
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

function buildGradient(color: string, fallback: string) {
  const parsed = parseHslTriplet(color)

  if (!parsed) return fallback

  const accentLightness = Math.min(parsed.lightness + 8, 92)

  return `linear-gradient(135deg, hsl(${parsed.hue} ${parsed.saturation}% ${parsed.lightness}%) 0%, hsl(${parsed.hue} ${Math.max(parsed.saturation - 4, 0)}% ${accentLightness}%) 100%)`
}

function buildCompanionColor(
  source: string,
  {
    hueShift,
    saturation,
    lightness,
  }: { hueShift: number; saturation: number; lightness: number },
) {
  const parsed = parseHslTriplet(source)

  if (!parsed) return null

  return formatHslTriplet({
    hue: (parsed.hue + hueShift + 360) % 360,
    saturation: clamp(Math.max(parsed.saturation - 6, saturation), 18, 92),
    lightness,
  })
}

function buildSurfaceColor(
  source: string,
  { saturation, lightness }: { saturation: number; lightness: number },
) {
  const parsed = parseHslTriplet(source)

  if (!parsed) return null

  return formatHslTriplet({
    hue: parsed.hue,
    saturation: clamp(Math.min(parsed.saturation, saturation), 12, 88),
    lightness,
  })
}

function buildForegroundColor(source: string, darkLightness = 24) {
  const parsed = parseHslTriplet(source)

  if (!parsed) return defaultPrimaryForeground

  if (parsed.lightness <= 50) {
    return '0 0% 100%'
  }

  return formatHslTriplet({
    hue: parsed.hue,
    saturation: clamp(parsed.saturation, 18, 54),
    lightness: darkLightness,
  })
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
    secondaryColor: branding.secondaryColor,
    accentColor: branding.accentColor,
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

  const normalizedPrimary = normalizeThemeColor(tenant.primaryColor)
  const resolvedPrimary = normalizedPrimary ?? defaultPrimaryColor
  const normalizedSecondary = normalizeThemeColor(tenant.secondaryColor)
  const normalizedAccent = normalizeThemeColor(tenant.accentColor)
  const resolvedSecondary =
    normalizedSecondary ??
    buildCompanionColor(resolvedPrimary, {
      hueShift: 200,
      saturation: 42,
      lightness: 29,
    }) ??
    defaultSecondaryColor
  const resolvedAccent =
    normalizedAccent ??
    buildCompanionColor(resolvedPrimary, {
      hueShift: -97,
      saturation: 64,
      lightness: 52,
    }) ??
    defaultAccentColor
  const secondarySurface =
    buildSurfaceColor(resolvedSecondary, { saturation: 28, lightness: 95 }) ??
    '352 24% 95%'
  const accentSurface =
    buildSurfaceColor(resolvedAccent, { saturation: 42, lightness: 92 }) ??
    '43 65% 92%'
  const secondaryForeground = buildForegroundColor(resolvedSecondary)
  const accentForeground = buildForegroundColor(resolvedAccent, 26)

  root.style.setProperty('--primary', resolvedPrimary)
  root.style.setProperty('--ring', resolvedPrimary)
  root.style.setProperty('--success', resolvedPrimary)
  root.style.setProperty('--secondary', secondarySurface)
  root.style.setProperty('--secondary-foreground', secondaryForeground)
  root.style.setProperty('--accent', accentSurface)
  root.style.setProperty('--accent-foreground', accentForeground)
  root.style.setProperty('--brand-secondary', resolvedSecondary)
  root.style.setProperty(
    '--brand-secondary-foreground',
    buildForegroundColor(resolvedSecondary, 98),
  )
  root.style.setProperty('--brand-accent', resolvedAccent)
  root.style.setProperty(
    '--brand-accent-foreground',
    buildForegroundColor(resolvedAccent, 22),
  )
  root.style.setProperty('--sidebar-primary', resolvedPrimary)
  root.style.setProperty('--sidebar-ring', resolvedPrimary)
  root.style.setProperty('--sidebar-accent', secondarySurface)
  root.style.setProperty('--sidebar-accent-foreground', secondaryForeground)
  root.style.setProperty('--primary-foreground', defaultPrimaryForeground)
  root.style.setProperty(
    '--sidebar-primary-foreground',
    defaultPrimaryForeground,
  )
  root.style.setProperty(
    '--gradient-primary',
    buildGradient(resolvedPrimary, defaultGradientPrimary),
  )
  root.style.setProperty(
    '--gradient-secondary',
    buildGradient(resolvedSecondary, defaultGradientSecondary),
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
