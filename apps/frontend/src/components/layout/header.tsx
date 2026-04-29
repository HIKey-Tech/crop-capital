import { Bell, Menu, User } from 'lucide-react'
import {
  Link,
  useNavigate,
  useParams,
  useRouteContext,
} from '@tanstack/react-router'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTenant } from '@/contexts/tenant'
import { useViewMode } from '@/contexts/view-mode'
import { useLogout, useNotifications } from '@/hooks'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useRouteContext({ from: '/$tenant/_authenticated' })
  const params = useParams({ strict: false })
  const { notifications, unreadCount, markAllAsRead } = useNotifications()
  const { mutate: logout } = useLogout()
  const { tenant } = useTenant()
  const { viewMode } = useViewMode()
  const tenantParam = params.tenant ?? ''

  const navigate = useNavigate()

  // Get the 2 most recent notifications for the dropdown
  const recentNotifications = notifications.slice(0, 2)

  // Extract first name from full name
  const firstName = user.name.split(' ')[0] || 'User'

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        navigate({
          to: '/$tenant/auth/sign-in',
          params: { tenant: tenantParam },
        })
        toast.success('Signed out successfully')
      },
    })
  }

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-muted rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            {tenant.displayName} ·{' '}
            {viewMode === 'admin' ? 'Admin workspace' : 'Investor workspace'}
          </div>
          <h1 className="truncate text-2xl font-bold text-foreground">
            Hi, {firstName}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <div className="px-3 py-2 border-b border-border flex items-center justify-between gap-2">
              <p className="font-semibold">Notifications</p>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:underline shrink-0"
                >
                  Mark all as read
                </button>
              )}
            </div>
            {recentNotifications.length > 0 ? (
              <>
                {recentNotifications.map((notif) => (
                  <DropdownMenuItem key={notif.id} className="py-3">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">{notif.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {notif.message}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            ) : (
              <div className="py-4 px-3 text-center text-sm text-muted-foreground">
                No notifications yet
              </div>
            )}
            <DropdownMenuItem className="justify-center text-primary" asChild>
              <Link
                to="/$tenant/notifications"
                params={{ tenant: tenantParam }}
              >
                View all notifications
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border border-border"
            >
              <User className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link
                to="/$tenant/settings"
                params={{ tenant: tenantParam }}
                className="w-full"
              >
                Profile Settings
              </Link>
            </DropdownMenuItem>
            {user.role === 'admin' && (
              <DropdownMenuItem asChild>
                <Link
                  to="/$tenant/admin"
                  params={{ tenant: tenantParam }}
                  className="w-full"
                >
                  Admin Dashboard
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive cursor-pointer"
              onClick={handleLogout}
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
