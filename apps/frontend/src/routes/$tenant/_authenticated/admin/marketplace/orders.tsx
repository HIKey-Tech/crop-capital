import { useState } from 'react'
import clsx from 'clsx'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import type { ColumnDef } from '@tanstack/react-table'

import type { CommodityOrder, CommodityOrderStatus } from '@/types'

import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useTenant } from '@/contexts/tenant'
import { useCommodityOrders, useUpdateCommodityOrderStatus } from '@/hooks'
import { formatCurrency } from '@/lib/format-currency'
import { formatDate } from '@/lib/format-date'

export const Route = createFileRoute(
  '/$tenant/_authenticated/admin/marketplace/orders',
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
  const { data, isLoading, error } = useCommodityOrders()
  const updateOrderStatus = useUpdateCommodityOrderStatus()
  const { tenant } = useTenant()

  const [pendingCancel, setPendingCancel] = useState<{
    orderId: string
    buyerName: string
  } | null>(null)

  const applyStatusChange = async (
    orderId: string,
    status: CommodityOrderStatus,
  ) => {
    try {
      await updateOrderStatus.mutateAsync({ id: orderId, data: { status } })
      toast.success('Order status updated')
    } catch (statusError) {
      console.error('Failed to update order status', statusError)
      toast.error('Could not update order status')
    }
  }

  const handleStatusChange = (
    orderId: string,
    buyerName: string,
    status: CommodityOrderStatus,
  ) => {
    if (status === 'cancelled') {
      setPendingCancel({ orderId, buyerName })
      return
    }

    void applyStatusChange(orderId, status)
  }

  const confirmCancel = async () => {
    if (!pendingCancel) return
    await applyStatusChange(pendingCancel.orderId, 'cancelled')
    setPendingCancel(null)
  }

  const columns: Array<ColumnDef<CommodityOrder>> = [
    {
      accessorKey: 'buyerName',
      header: 'Buyer',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">
            {row.original.buyerName}
          </p>
          <p className="text-sm text-muted-foreground">
            {row.original.buyerEmail}
          </p>
        </div>
      ),
    },
    {
      id: 'items',
      header: 'Items',
      cell: ({ row }) => (
        <div className="space-y-1 text-sm">
          {row.original.items.slice(0, 2).map((item) => (
            <p key={`${row.original._id}-${item.commodity}`}>
              {item.name} · {item.quantity} {item.unit}
            </p>
          ))}
          {row.original.items.length > 2 ? (
            <p className="text-muted-foreground">
              +{row.original.items.length - 2} more lines
            </p>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: 'subtotal',
      header: 'Subtotal',
      cell: ({ row }) =>
        formatCurrency(row.original.subtotal, row.original.currency),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const appearance = orderStatusAppearance[row.original.status]

        return (
          <div className="flex items-center gap-3">
            <Badge className={clsx('border', appearance.className)}>
              {appearance.label}
            </Badge>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={row.original.status}
              onChange={(event) =>
                handleStatusChange(
                  row.original._id,
                  row.original.buyerName,
                  event.target.value as CommodityOrderStatus,
                )
              }
            >
              {(
                ['pending', 'confirmed', 'fulfilled', 'cancelled'] as const
              ).map((status) => (
                <option key={status} value={status}>
                  {orderStatusAppearance[status].label}
                </option>
              ))}
            </select>
          </div>
        )
      },
    },
  ]

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-destructive">Failed to load orders.</p>
      </div>
    )
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 pb-10 space-y-8">
      <header className="pt-6 space-y-2">
        <p className="text-xs text-muted-foreground">
          {tenant.displayName} · Orders
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Review buyer orders
        </h1>
        <p className="text-muted-foreground">
          Every order placed from the marketplace arrives here with reserved
          inventory.
        </p>
      </header>

      <DataTable
        columns={columns}
        data={data?.orders ?? []}
        loading={isLoading}
        searchPlaceholder="Search buyers or order contents..."
        pageSize={10}
      />

      <AlertDialog
        open={pendingCancel !== null}
        onOpenChange={(open) => {
          if (!open) setPendingCancel(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingCancel
                ? `Cancelling ${pendingCancel.buyerName}'s order will release the reserved inventory back to stock. This cannot be undone without re-confirming the order manually.`
                : 'Cancelling the order will release the reserved inventory.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateOrderStatus.isPending}>
              Keep order
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmCancel}
              disabled={updateOrderStatus.isPending}
            >
              {updateOrderStatus.isPending ? 'Cancelling…' : 'Cancel order'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
