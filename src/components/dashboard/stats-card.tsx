import { TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  label: string
  value: string
  trend?: string
  trendLabel?: string
  icon?: React.ReactNode
  description?: string
  className?: string
}

export function StatsCard({
  label,
  value,
  trend,
  trendLabel,
  icon,
  description,
  className,
}: StatsCardProps) {
  const isPositive = trend?.startsWith('+')

  return (
    <div
      className={cn(
        'stat-card rounded-lg border border-border bg-card px-5 py-4 flex flex-col items-start',
        'transition-colors', // No shadow, plain border
        className,
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        {icon || <TrendingUp className="w-4 h-4 text-primary" />}
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
      </div>
      <span className="mt-2 text-3xl font-extrabold text-foreground leading-tight">
        {value}
      </span>
      {trend && (
        <span
          className={cn(
            'mt-1 text-xs font-medium tracking-wide',
            isPositive ? 'text-primary' : 'text-muted-foreground',
          )}
        >
          {trend}{' '}
          <span className="font-normal text-muted-foreground">
            {trendLabel}
          </span>
        </span>
      )}
      {description && (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
