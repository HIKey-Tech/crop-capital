import { Link } from '@tanstack/react-router'
import { forwardRef } from 'react'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

interface NavLinkProps extends Omit<ComponentProps<typeof Link>, 'className'> {
  className?: string
  activeClassName?: string
  pendingClassName?: string
  exact?: boolean
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  (
    {
      className,
      activeClassName,
      pendingClassName,
      exact = false,
      to,
      ...props
    },
    ref,
  ) => {
    return (
      <Link
        ref={ref}
        to={to}
        activeProps={{
          className: cn(className, activeClassName),
        }}
        activeOptions={{
          exact,
          includeSearch: false,
        }}
        className={className}
        {...props}
      />
    )
  },
)

NavLink.displayName = 'NavLink'

export { NavLink }
