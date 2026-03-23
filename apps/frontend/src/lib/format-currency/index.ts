import type { CurrencyCode } from '@/types'

export const currencyOptions: Array<{ value: CurrencyCode; label: string }> = [
  { value: 'NGN', label: 'Nigerian Naira (NGN)' },
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'GHS', label: 'Ghanaian Cedi (GHS)' },
  { value: 'KES', label: 'Kenyan Shilling (KES)' },
]

export function getCurrencyLocale(currency: string): string {
  switch (currency) {
    case 'USD':
      return 'en-US'
    case 'GHS':
      return 'en-GH'
    case 'KES':
      return 'en-KE'
    case 'NGN':
    default:
      return 'en-NG'
  }
}

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (default: NGN)
 * @param locale - The locale for formatting
 */
export function formatCurrency(
  amount: number,
  currency = 'NGN',
  locale = getCurrencyLocale(currency),
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format a number as compact currency (e.g., ₦1.5M)
 */
export function formatCompactCurrency(
  amount: number,
  currency = 'NGN',
  locale = getCurrencyLocale(currency),
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount)
}

/**
 * Parse a currency string back to number
 */
export function parseCurrency(value: string): number {
  return Number(value.replace(/[^0-9.-]+/g, ''))
}
