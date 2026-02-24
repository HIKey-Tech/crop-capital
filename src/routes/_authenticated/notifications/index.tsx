import { Link, createFileRoute } from '@tanstack/react-router'
import { Bell, CheckCircle, DollarSign, Sprout, TrendingUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { useNotifications } from '@/hooks'
import { formatDate } from '@/lib/format-date'

export const Route = createFileRoute('/_authenticated/notifications/')({
  component: NotificationsPage,
})

function NotificationsPage() {
  const { notifications, isLoading, error } = useNotifications()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-muted-foreground">Failed to load notifications</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'payout':
        return <DollarSign className="h-5 w-5" />
      case 'investment':
        return <TrendingUp className="h-5 w-5" />
      case 'milestone':
        return <Sprout className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getIconStyle = (type: string) => {
    switch (type) {
      case 'payout':
        return 'bg-blue-100 text-blue-600'
      case 'investment':
        return 'bg-green-100 text-green-600'
      case 'milestone':
        return 'bg-amber-100 text-amber-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated on your investments and account activity.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <Link
              key={notif.id}
              to={notif.investmentId ? '/investments/$id' : '/dashboard'}
              params={notif.investmentId ? { id: notif.investmentId } : {}}
              className="group flex gap-4 p-4 rounded-xl border bg-card border-border hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <div
                className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${getIconStyle(notif.type)}`}
              >
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-sm text-foreground">
                    {notif.title}
                  </h3>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(notif.date)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {notif.message}
                </p>
              </div>

              <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity">
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            </Link>
          ))
        ) : (
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            description="Your investment updates and alerts will appear here."
            className="py-12"
          >
            <Button asChild className="mt-4">
              <Link to="/farms">Start Investing</Link>
            </Button>
          </EmptyState>
        )}
      </div>
    </div>
  )
}
