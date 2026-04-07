import { Link, useParams } from '@tanstack/react-router'
import {
  ArrowLeftRight,
  Bell,
  FileBarChart,
  FolderOpen,
  LayoutDashboard,
  Newspaper,
  Receipt,
  Search,
  Settings,
  Shield,
  Users,
  Wallet,
  X,
} from 'lucide-react'

import { NavLink } from '@/components/nav-link'
import { useTenant } from '@/contexts/tenant'
import { useViewMode } from '@/contexts/view-mode'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const investorNavItems = [
  { to: '/$tenant/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    to: '/$tenant/investments',
    label: 'My Investments',
    icon: FolderOpen,
    feature: 'investments' as const,
  },
  {
    to: '/$tenant/wallet',
    label: 'Returns',
    icon: Wallet,
    feature: 'wallet' as const,
  },
  {
    to: '/$tenant/transactions',
    label: 'Transactions',
    icon: Receipt,
    feature: 'transactions' as const,
  },
  {
    to: '/$tenant/farms',
    label: 'Discover Farms',
    icon: Search,
    feature: 'farms' as const,
  },
  {
    to: '/$tenant/news',
    label: 'News & Updates',
    icon: Newspaper,
    feature: 'news' as const,
  },
  {
    to: '/$tenant/notifications',
    label: 'Notifications',
    icon: Bell,
    feature: 'notifications' as const,
  },
  { to: '/$tenant/settings', label: 'Settings', icon: Settings },
]

const adminNavItems = [
  { to: '/$tenant/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    to: '/$tenant/admin/farms',
    label: 'Farms',
    icon: FolderOpen,
    feature: 'adminFarms' as const,
  },
  {
    to: '/$tenant/admin/investors',
    label: 'Investors',
    icon: Users,
    feature: 'adminInvestors' as const,
  },
  {
    to: '/$tenant/admin/transactions',
    label: 'Transactions',
    icon: Receipt,
    feature: 'adminTransactions' as const,
  },
  {
    to: '/$tenant/admin/payouts',
    label: 'Bank Payouts',
    icon: Wallet,
    feature: 'adminPayouts' as const,
  },
  {
    to: '/$tenant/admin/kyc',
    label: 'KYC Review',
    icon: FileBarChart,
    feature: 'adminKyc' as const,
  },
  {
    to: '/$tenant/admin/reports',
    label: 'Reports',
    icon: FileBarChart,
    feature: 'adminReports' as const,
  },
  { to: '/$tenant/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const params = useParams({ strict: false })
  const { viewMode, isAdmin, toggleViewMode } = useViewMode()
  const { tenant } = useTenant()
  const tenantSlug = params.tenant ?? tenant.slug
  const canUseAdminView = tenant.features.adminPortal

  const visibleInvestorNavItems = investorNavItems.filter(
    (item) => !item.feature || tenant.features[item.feature],
  )

  const visibleAdminNavItems = adminNavItems.filter(
    (item) => !item.feature || tenant.features[item.feature],
  )

  const navItems =
    viewMode === 'admin' && canUseAdminView
      ? visibleAdminNavItems
      : visibleInvestorNavItems

  return (
    <>
      {/* Mobile overlay */}
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
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-6 border-b border-sidebar-border">
          <Link
            to="/$tenant"
            params={{ tenant: tenantSlug }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              {tenant.logoUrl ? (
                <img
                  src={tenant.logoUrl}
                  alt={tenant.displayName}
                  className="w-5 h-5 object-contain"
                />
              ) : (
                <span className="text-primary-foreground font-bold text-sm">
                  {tenant.shortName}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground leading-tight">
                {tenant.displayName}
              </span>
              <span className="max-w-32 truncate text-xs text-muted-foreground leading-tight">
                {tenant.tagline}
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

        {/* Navigation */}
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
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* View Mode Toggle (admin only) */}
        {isAdmin && canUseAdminView && (
          <div className="px-3 pb-2">
            <button
              onClick={toggleViewMode}
              className={cn(
                'flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                'hover:bg-muted text-muted-foreground',
              )}
            >
              {viewMode === 'admin' ? (
                <>
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>Switch to Investor</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Switch to Admin</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-4 border-t border-sidebar-border">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {tenant.legalName}
          </p>
        </div>
      </aside>
    </>
  )
}
