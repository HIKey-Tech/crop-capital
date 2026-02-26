/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (default: NGN)
 * @param locale - The locale for formatting (default: en-NG)
 */
export function formatCurrency(
  amount: number,
  currency = 'NGN',
  locale = 'en-NG',
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
  locale = 'en-NG',
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
