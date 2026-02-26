/**
 * Format a date as a readable string
 * @param date - The date to format (Date object or ISO string)
 * @param options - Intl.DateTimeFormatOptions for customization
 * @param locale - The locale for formatting (default: undefined for user's locale)
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
  locale?: string,
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString(locale, options)
}

/**
 * Format a date as a full datetime string
 */
export function formatDateTime(date: Date | string, locale?: string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  } as Intl.DateTimeFormatOptions)
}

/**
 * Format a date as relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInMs = now.getTime() - dateObj.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
  return `${Math.floor(diffInDays / 365)} years ago`
}

/**
 * Format a date as ISO string (YYYY-MM-DD)
 */
export function formatISODate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toISOString().split('T')[0]
}
