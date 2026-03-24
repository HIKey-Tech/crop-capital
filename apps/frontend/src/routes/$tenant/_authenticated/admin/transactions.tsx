import { createFileRoute } from '@tanstack/react-router'
import { Download } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

import type { Farm, Investment, User } from '@/types'

import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTenant } from '@/contexts/tenant'
import { useAllInvestments } from '@/hooks'
import { exportToCSV } from '@/lib/export-csv'
import { formatDate } from '@/lib/format-date'
import { formatCurrency } from '@/lib/format-currency'

export const Route = createFileRoute(
  '/$tenant/_authenticated/admin/transactions',
)({
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
  const { tenant } = useTenant()
  const { data, isLoading, error } = useAllInvestments()
  const transactions = data?.investments ?? []

  const handleExport = () => {
    const safeName = tenant.displayName.toLowerCase().replace(/[^a-z0-9]/g, '-')
    exportToCSV(
      transactions,
      [
        { header: 'Date', value: (t) => formatDate(t.createdAt) },
        {
          header: 'Investor',
          value: (t) =>
            typeof t.investor === 'string' ? t.investor : t.investor.name,
        },
        {
          header: 'Email',
          value: (t) =>
            typeof t.investor === 'string' ? '' : t.investor.email,
        },
        {
          header: 'Farm',
          value: (t) => (typeof t.farm === 'string' ? t.farm : t.farm.name),
        },
        { header: 'Amount', value: (t) => t.amount },
        { header: 'Currency', value: (t) => t.currency },
        {
          header: 'Type',
          value: (t) => (t.roiPaid ? 'ROI Payout' : 'Investment'),
        },
        { header: 'Status', value: (t) => t.status },
      ],
      `${safeName}-transactions-${new Date().toISOString().slice(0, 10)}`,
    )
  }

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
        <span className="text-xs text-muted-foreground">
          {tenant.displayName} admin · Transactions
        </span>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Transactions across {tenant.displayName}
        </h1>
        <p className="text-base text-muted-foreground">
          Monitor investments and ROI payouts made by users inside{' '}
          {tenant.displayName}.
        </p>
      </header>

      <section className="bg-card rounded-xl border border-border overflow-hidden">
        <header className="px-6 py-3 border-b border-border flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            Transaction overview
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isLoading || !transactions.length}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
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
