import { Link, useLocation } from '@tanstack/react-router'
import {
  FileBarChart,
  FolderOpen,
  LayoutDashboard,
  Newspaper,
  Receipt,
  Search,
  Users,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  userRole?: 'investor' | 'admin'
  isOpen?: boolean
  onClose?: () => void
}

const investorNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/my-investments', label: 'My Investment', icon: FolderOpen },
  { href: '/transactions', label: 'Transactions', icon: Receipt },
  { href: '/discover', label: 'Discover Farms', icon: Search },
  { href: '/news', label: 'News & Updates', icon: Newspaper },
]

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/farms', label: 'Farms', icon: FolderOpen },
  { href: '/admin/investors', label: 'Investors', icon: Users },
  { href: '/admin/transactions', label: 'Transactions', icon: Receipt },
  { href: '/admin/reports', label: 'Reports', icon: FileBarChart },
]

export function Sidebar({
  userRole = 'investor',
  isOpen,
  onClose,
}: SidebarProps) {
  const location = useLocation()
  const navItems = userRole === 'admin' ? adminNavItems : investorNavItems

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
          'fixed left-0 top-0 z-50 h-full w-[220px] bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 lg:translate-x-0',
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
                African Youth
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
            const isActive = location.pathname === item.href

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={cn('nav-link', isActive && 'active')}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-sidebar-border">
          <p className="text-xs text-muted-foreground">
            © 2024 African Youth Forum
          </p>
        </div>
      </aside>
    </>
  )
}
