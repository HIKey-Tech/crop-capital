import { Link, useLocation } from '@tanstack/react-router'
import { forwardRef } from 'react'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

interface NavLinkProps extends Omit<ComponentProps<typeof Link>, 'className'> {
  className?: string
  activeClassName?: string
  pendingClassName?: string
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    const location = useLocation()
    const isActive =
      location.pathname === to || location.pathname.startsWith(`${to}/`)

    return (
      <Link
        ref={ref}
        to={to}
        className={cn(className, isActive && activeClassName)}
        {...props}
      />
    )
  },
)

NavLink.displayName = 'NavLink'

export { NavLink }
