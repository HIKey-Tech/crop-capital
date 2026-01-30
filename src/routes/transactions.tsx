import { createFileRoute } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'

import type { Farm, Investment } from '@/types'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { useMyInvestments } from '@/hooks'
import { formatDate } from '@/lib/format-date'
import { formatCurrency } from '@/lib/format-currency'

export const Route = createFileRoute('/transactions')({
  component: TransactionsPage,
})

const columns: Array<ColumnDef<Investment>> = [
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">
        {formatDate(getValue() as string)}
      </span>
    ),
  },
  {
    id: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const isPaid = row.original.roiPaid
      return (
        <span
          className={
            isPaid
              ? 'px-3 py-1 rounded-full bg-blue-100 text-primary border border-blue-300 text-xs font-semibold'
              : 'px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-semibold'
          }
        >
          {isPaid ? 'ROI Payout' : 'Investment'}
        </span>
      )
    },
  },
  {
    accessorKey: 'farm',
    header: 'Farm',
    cell: ({ getValue }) => {
      const farm = getValue() as string | Farm
      const farmName = typeof farm === 'string' ? 'Unknown' : farm.name
      return <span className="text-muted-foreground">{farmName}</span>
    },
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ getValue, row }) => {
      const amount = getValue() as number
      const isPaid = row.original.roiPaid
      return (
        <span
          className={isPaid ? 'text-primary font-semibold' : 'font-semibold'}
        >
          +{formatCurrency(amount)}
        </span>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue() as string
      return status === 'completed' ? (
        <Badge className="border border-green-500 px-2.5 py-1 text-green-700 bg-green-100/80 rounded-full font-medium text-xs uppercase">
          Completed
        </Badge>
      ) : status === 'pending' ? (
        <Badge className="border border-yellow-500 px-2.5 py-1 text-yellow-800 bg-yellow-100/80 rounded-full font-medium text-xs uppercase">
          Pending
        </Badge>
      ) : (
        <Badge className="border border-zinc-400 px-2.5 py-1 text-zinc-700 bg-zinc-100/80 rounded-full font-medium text-xs uppercase">
          {status}
        </Badge>
      )
    },
  },
]

function TransactionsPage() {
  const { data, isLoading, error } = useMyInvestments()

  const transactions = data?.investments ?? []

  if (error) {
    return (
      <DashboardLayout userRole="investor">
        <div className="flex items-center justify-center h-96">
          <p className="text-red-500">
            Failed to load transactions. Please try again.
          </p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="investor">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground">
            View your investment and payout history.
          </p>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <DataTable
            columns={columns}
            data={transactions}
            loading={isLoading}
            searchPlaceholder="Search transactions..."
            pageSize={10}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
