import { Link } from '@tanstack/react-router'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
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
          <Link to="/" className="hover:text-foreground transition-colors">
            <Home className="w-4 h-4" />
          </Link>
          {items.length > 0 && <ChevronRight className="w-4 h-4 mx-2" />}
        </>
      )}

      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={index} className="flex items-center">
            {item.href && !isLast ? (
              <Link
                to={item.href}
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
