import clsx from 'clsx'
import { createFileRoute } from '@tanstack/react-router'
import { ClipboardList } from 'lucide-react'

import type { CommodityOrderStatus } from '@/types'

import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/ui/loading'
import { Badge } from '@/components/ui/badge'
import { useTenant } from '@/contexts/tenant'
import { useMyCommodityOrders } from '@/hooks'
import { formatCurrency } from '@/lib/format-currency'
import { formatDate } from '@/lib/format-date'

export const Route = createFileRoute(
  '/$tenant/_authenticated/marketplace/orders',
)({
  component: MarketplaceOrdersPage,
})

const orderStatusAppearance: Record<
  CommodityOrderStatus,
  { className: string; label: string }
> = {
  pending: {
    className: 'border-amber-200 bg-amber-50 text-amber-800',
    label: 'Pending',
  },
  confirmed: {
    className: 'border-sky-200 bg-sky-50 text-sky-800',
    label: 'Confirmed',
  },
  fulfilled: {
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    label: 'Fulfilled',
  },
  cancelled: {
    className: 'border-red-200 bg-red-50 text-red-700',
    label: 'Cancelled',
  },
}

function MarketplaceOrdersPage() {
  const { data, isLoading, error } = useMyCommodityOrders()
  const { tenant } = useTenant()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-destructive">Failed to load your orders.</p>
      </div>
    )
  }

  const orders = data?.orders ?? []

  return (
    <div className="space-y-6 px-4 pb-10 animate-fade-in">
      <header className="space-y-2 pt-6">
        <p className="text-xs text-muted-foreground">
          {tenant.displayName} · Marketplace
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          My orders
        </h1>
        <p className="text-muted-foreground">
          Track every commodity order you have placed and its current
          fulfillment state.
        </p>
      </header>

      {orders.length > 0 ? (
        <div className="grid gap-4">
          {orders.map((order) => (
            <article
              key={order._id}
              className="rounded-3xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-foreground">
                      Order placed {formatDate(order.createdAt)}
                    </h2>
                    <Badge
                      className={clsx(
                        'border',
                        orderStatusAppearance[order.status].className,
                      )}
                    >
                      {orderStatusAppearance[order.status].label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.items.length} line
                    {order.items.length === 1 ? '' : 's'} ·{' '}
                    {formatCurrency(order.subtotal, order.currency)}
                  </p>
                </div>

                {order.deliveryAddress ? (
                  <p className="max-w-md text-sm text-muted-foreground">
                    Delivery: {order.deliveryAddress}
                  </p>
                ) : null}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {order.items.map((item) => (
                  <div
                    key={`${order._id}-${item.commodity}`}
                    className="rounded-2xl border border-border bg-background p-3"
                  >
                    <div className="flex items-start gap-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-14 w-14 rounded-xl object-cover"
                        />
                      ) : null}
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          {item.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} {item.unit}
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {formatCurrency(item.lineTotal, order.currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No orders yet"
          description="Orders placed from the marketplace will appear here once submitted."
          icon={ClipboardList}
        />
      )}
    </div>
  )
}
