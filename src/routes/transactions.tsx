import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Download, Search } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

import type { Farm, Investment } from '@/types'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { useMyInvestments } from '@/hooks'
import { formatCurrency } from '@/lib/format-currency'
import { formatDate } from '@/lib/format-date'

export const Route = createFileRoute('/transactions')({
  component: TransactionsPage,
})

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  status: string
  type: 'investment' | 'payout'
  investmentId: string
}

const columns: Array<ColumnDef<Transaction>> = [
  {
    accessorKey: 'id',
    header: 'Ref ID',
    cell: ({ getValue }) => (
      <span className="font-mono text-xs">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const tx = row.original
      return (
        <Link
          to="/investments/$id"
          params={{ id: tx.investmentId }}
          className="font-medium hover:underline text-primary"
        >
          {tx.description}
        </Link>
      )
    },
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ getValue }) => (
      <span className="capitalize text-muted-foreground">
        {getValue() as string}
      </span>
    ),
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => {
      const tx = row.original
      const isPositive = tx.type === 'payout'
      return (
        <span
          className={
            isPositive
              ? 'text-green-600 font-bold'
              : 'text-foreground font-medium'
          }
        >
          {isPositive ? '+' : '-'}
          {formatCurrency(Math.abs(tx.amount))}
        </span>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue() as string
      return (
        <Badge
          variant="outline"
          className={`capitalize ${status === 'completed' ? 'border-green-200 text-green-700 bg-green-50' : 'border-yellow-200 text-yellow-700 bg-yellow-50'}`}
        >
          {status}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    cell: () => (
      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
        <Download className="h-4 w-4" />
        <span className="sr-only">Download Receipt</span>
      </Button>
    ),
  },
]

function TransactionsPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading, error } = useMyInvestments()

  // Transform investments into transactions
  const transactions: Array<Transaction> = (data?.investments || []).flatMap(
    (inv: Investment) => {
      const farm = inv.farm as Farm
      const txs: Array<Transaction> = []

      // Investment transaction
      txs.push({
        id: `INV-${inv._id.slice(-8).toUpperCase()}`,
        date: inv.createdAt,
        description: `Investment: ${farm.name || 'Farm'}`,
        amount: inv.amount,
        status: inv.status,
        type: 'investment',
        investmentId: inv._id,
      })

      // ROI payout transaction (if paid)
      if (inv.roiPaid) {
        const roiAmount = inv.projectedReturn
          ? inv.projectedReturn - inv.amount
          : inv.amount * (inv.roi / 100)
        txs.push({
          id: `PAY-${inv._id.slice(-8).toUpperCase()}`,
          date: inv.updatedAt,
          description: `ROI Payout: ${farm.name || 'Farm'}`,
          amount: roiAmount,
          status: 'completed',
          type: 'payout',
          investmentId: inv._id,
        })
      }

      return txs
    },
  )

  // Sort by date (newest first)
  transactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  const filteredData = transactions.filter(
    (t) =>
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()),
  )

  if (isLoading) {
    return (
      <DashboardLayout userRole="investor">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout userRole="investor">
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <p className="text-muted-foreground">Failed to load transactions</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="investor">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Transaction History
            </h1>
            <p className="text-muted-foreground">
              View and download your financial records.
            </p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>

        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b flex items-center gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID or description..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground mb-2">No transactions yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Your investment transactions will appear here
              </p>
              <Button asChild>
                <Link to="/discover">Explore Farms</Link>
              </Button>
            </div>
          ) : (
            <DataTable columns={columns} data={filteredData} />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
