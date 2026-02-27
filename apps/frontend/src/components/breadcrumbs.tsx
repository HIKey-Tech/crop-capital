import { Link, useParams } from '@tanstack/react-router'
import type { ComponentProps } from 'react'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

type RouterLinkProps = ComponentProps<typeof Link>

export interface BreadcrumbItem {
  label: string
  to?: RouterLinkProps['to']
  params?: Record<string, string>
}

interface BreadcrumbsProps {
  items: Array<BreadcrumbItem>
  showHomeIcon?: boolean
  className?: string
}

export function Breadcrumbs({
  items,
  showHomeIcon = false,
  className,
}: BreadcrumbsProps) {
  const params = useParams({ strict: false })
  const tenant = params.tenant

  return (
    <nav
      className={cn(
        'flex items-center text-sm text-muted-foreground',
        className,
      )}
      aria-label="Breadcrumb"
    >
      {showHomeIcon && (
        <>
          {tenant ? (
            <Link
              to="/$tenant/dashboard"
              params={{ tenant }}
              className="hover:text-foreground transition-colors"
            >
              <Home className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/auth"
              className="hover:text-foreground transition-colors"
            >
              <Home className="w-4 h-4" />
            </Link>
          )}
          {items.length > 0 && <ChevronRight className="w-4 h-4 mx-2" />}
        </>
      )}

      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={index} className="flex items-center">
            {item.to && !isLast ? (
              <Link
                to={item.to}
                params={item.params as never}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  isLast && 'text-foreground font-medium',
                  !isLast && 'hover:text-foreground transition-colors',
                )}
              >
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRight className="w-4 h-4 mx-2" />}
          </div>
        )
      })}
    </nav>
  )
}
