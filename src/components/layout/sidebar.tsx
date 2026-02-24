import { Link } from '@tanstack/react-router'
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
import { cn } from '@/lib/utils'
import { useViewMode } from '@/contexts/view-mode'
import { NavLink } from '@/components/nav-link'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const investorNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/investments', label: 'My Investments', icon: FolderOpen },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
  { href: '/transactions', label: 'Transactions', icon: Receipt },
  { href: '/farms', label: 'Discover Farms', icon: Search },
  { href: '/news', label: 'News & Updates', icon: Newspaper },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const adminNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/farms', label: 'Farms', icon: FolderOpen },
  { href: '/admin/investors', label: 'Investors', icon: Users },
  { href: '/admin/transactions', label: 'Transactions', icon: Receipt },
  { href: '/admin/payouts', label: 'Payouts', icon: Wallet },
  { href: '/admin/kyc', label: 'KYC Review', icon: FileBarChart },
  { href: '/admin/reports', label: 'Reports', icon: FileBarChart },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { viewMode, isAdmin, toggleViewMode } = useViewMode()
  const navItems = viewMode === 'admin' ? adminNavItems : investorNavItems

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
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                AYF
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground leading-tight">
                Africa Youth
              </span>
              <span className="text-sm font-semibold text-primary leading-tight">
                Forum
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
                key={item.href}
                to={item.href}
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
        {isAdmin && (
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
            © {new Date().getFullYear()} Africa Youth Forum
          </p>
        </div>
      </aside>
    </>
  )
}
