import { Link, useNavigate } from '@tanstack/react-router'
import {
  Building2,
  Globe2,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { NavLink } from '@/components/nav-link'
import { clearAuthToken } from '@/lib/api-client'

interface SuperAdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const navItems = [
  { to: '/super-admin', label: 'Overview', icon: LayoutDashboard },
  { to: '/super-admin/tenants', label: 'Tenants', icon: Building2 },
  { to: '/super-admin/access', label: 'Access Guide', icon: Globe2 },
  { to: '/super-admin/readiness', label: 'Readiness', icon: ShieldCheck },
]

export function SuperAdminSidebar({ isOpen, onClose }: SuperAdminSidebarProps) {
  const navigate = useNavigate()

  const handleSignOut = () => {
    clearAuthToken()
    navigate({ to: '/auth' })
    toast.success('Signed out successfully')
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-55 bg-background border-r border-sidebar-border flex flex-col transition-transform duration-300 lg:translate-x-0 lg:bg-sidebar',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-5 py-6 border-b border-sidebar-border">
          <Link to="/super-admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground leading-tight">
                Platform
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                Super Admin
              </span>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-muted rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className="nav-link"
                activeClassName="active"
                activeOptions={
                  item.to === '/super-admin'
                    ? { exact: true, includeSearch: false }
                    : { exact: false, includeSearch: false }
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-sidebar-border">
          <button
            onClick={handleSignOut}
            className="nav-link w-full text-destructive hover:text-destructive"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
