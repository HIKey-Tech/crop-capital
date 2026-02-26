import { createFileRoute } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'

import type { Farm, Investment, User } from '@/types'

import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { useAllInvestments } from '@/hooks'
import { formatDate } from '@/lib/format-date'
import { formatCurrency } from '@/lib/format-currency'

export const Route = createFileRoute('/_authenticated/admin/transactions')({
  component: AdminTransactionsPage,
})

const columns: Array<ColumnDef<Investment>> = [
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ getValue }) => (
      <span className="text-muted-foreground font-medium whitespace-nowrap">
        {formatDate(getValue() as string)}
      </span>
    ),
  },
  {
    accessorKey: 'investor',
    header: 'User',
    cell: ({ getValue }) => {
      const investor = getValue() as string | User
      const userName = typeof investor === 'string' ? 'Unknown' : investor.name
      return (
        <span className="font-medium text-foreground whitespace-nowrap">
          {userName}
        </span>
      )
    },
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
              ? 'px-3 py-1 rounded-full bg-blue-100 text-primary border border-blue-300 text-xs font-semibold whitespace-nowrap'
              : 'px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-semibold whitespace-nowrap'
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
      const farmName = typeof farm === 'string' ? '-' : farm.name
      return (
        <span className="text-muted-foreground whitespace-nowrap">
          {farmName}
        </span>
      )
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
          className={
            isPaid
              ? 'text-primary font-semibold whitespace-nowrap'
              : 'text-emerald-700 font-semibold whitespace-nowrap'
          }
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
        <Badge className="border border-green-500 px-2.5 py-1 bg-green-100/80 text-green-700 text-xs font-medium uppercase whitespace-nowrap">
          Completed
        </Badge>
      ) : status === 'pending' ? (
        <Badge className="border border-yellow-500 px-2.5 py-1 bg-yellow-100/80 text-yellow-800 text-xs font-medium uppercase whitespace-nowrap">
          Pending
        </Badge>
      ) : (
        <Badge className="border border-zinc-400 px-2.5 py-1 bg-zinc-100/80 text-zinc-700 text-xs font-medium uppercase whitespace-nowrap">
          {status}
        </Badge>
      )
    },
  },
]

function AdminTransactionsPage() {
  const { data, isLoading, error } = useAllInvestments()
  const transactions = data?.investments ?? []

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500">
          Failed to load transactions. Please try again.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-screen-2xl mx-auto px-4 mb-10">
      <header className="pt-3 mb-2 flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          All Platform Transactions
        </h1>
        <p className="text-base text-muted-foreground">
          Monitor all transactions including investments and payouts made by
          users.
        </p>
      </header>

      <section className="bg-card rounded-xl border border-border overflow-hidden">
        <header className="px-6 py-3 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            Transactions Overview
          </h2>
        </header>
        <div className="p-4">
          <DataTable
            columns={columns}
            data={transactions}
            loading={isLoading}
            searchPlaceholder="Search by user, farm, or type..."
            pageSize={10}
          />
        </div>
      </section>
    </div>
  )
}
