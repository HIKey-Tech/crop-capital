import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowUpRight,
  DollarSign,
  TrendingUp,
  Wallet as WalletIcon,
} from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

import type { Investment } from '@/types'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { StatsCard } from '@/components/dashboard/stats-card'
import { useMyInvestments } from '@/hooks'
import { formatCurrency } from '@/lib/format-currency'
import { formatDate } from '@/lib/format-date'

export const Route = createFileRoute('/_authenticated/wallet/')({
  component: WalletPage,
})

interface WalletTransaction {
  id: string
  date: string
  type: string
  ref: string
  amount: number
  status: string
  investmentId: string
}

const columns: Array<ColumnDef<WalletTransaction>> = [
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
  {
    accessorKey: 'type',
    header: 'Transaction',
    cell: ({ getValue }) => (
      <span className="capitalize font-medium">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: 'ref',
    header: 'Reference',
    cell: ({ row }) => (
      <Link
        to="/investments/$id"
        params={{ id: row.original.investmentId }}
        className="font-mono text-xs text-primary hover:underline"
      >
        {row.original.ref}
      </Link>
    ),
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => {
      const tx = row.original
      const isPositive = tx.type === 'ROI Payout'
      return (
        <span
          className={
            isPositive ? 'text-green-600 font-medium' : 'text-foreground'
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
    cell: ({ getValue }) => (
      <span
        className={`text-xs px-2 py-1 rounded-full capitalize ${
          getValue() === 'completed'
            ? 'bg-green-100 text-green-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}
      >
        {getValue() as string}
      </span>
    ),
  },
]

function WalletPage() {
  const { data, isLoading, error } = useMyInvestments()

  // Calculate wallet stats from investments
  const investments = data?.investments || []
  const completedInvestments = investments.filter(
    (inv: Investment) => inv.status === 'completed',
  )

  const totalInvested = completedInvestments.reduce(
    (sum: number, inv: Investment) => sum + inv.amount,
    0,
  )

  const totalReturns = completedInvestments
    .filter((inv: Investment) => inv.roiPaid)
    .reduce((sum: number, inv: Investment) => {
      const roi = inv.projectedReturn
        ? inv.projectedReturn - inv.amount
        : inv.amount * (inv.roi / 100)
      return sum + roi
    }, 0)

  const pendingReturns = completedInvestments
    .filter((inv: Investment) => !inv.roiPaid)
    .reduce((sum: number, inv: Investment) => {
      const roi = inv.projectedReturn
        ? inv.projectedReturn - inv.amount
        : inv.amount * (inv.roi / 100)
      return sum + roi
    }, 0)

  // Transform investments to transactions
  const transactions: Array<WalletTransaction> = investments.flatMap(
    (inv: Investment) => {
      const txs: Array<WalletTransaction> = []

      // Investment transaction
      txs.push({
        id: inv._id,
        date: inv.createdAt,
        type: 'Investment',
        ref: `INV-${inv._id.slice(-8).toUpperCase()}`,
        amount: inv.amount,
        status: inv.status,
        investmentId: inv._id,
      })

      // ROI payout (if paid)
      if (inv.roiPaid) {
        const roiAmount = inv.projectedReturn
          ? inv.projectedReturn - inv.amount
          : inv.amount * (inv.roi / 100)
        txs.push({
          id: `${inv._id}-roi`,
          date: inv.updatedAt,
          type: 'ROI Payout',
          ref: `PAY-${inv._id.slice(-8).toUpperCase()}`,
          amount: roiAmount,
          status: 'completed',
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
        <p className="text-muted-foreground">Failed to load wallet data</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Wallet</h1>
          <p className="text-muted-foreground">
            Track your investments and returns.
          </p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link to="/discover">
            <TrendingUp className="h-4 w-4 mr-2" /> Invest Now
          </Link>
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <WalletIcon className="h-32 w-32" />
          </div>
          <div className="relative z-10">
            <p className="text-green-100 text-sm font-medium mb-1">
              Total Invested
            </p>
            <h2 className="text-4xl font-bold mb-6">
              {formatCurrency(totalInvested)}
            </h2>
            <div className="flex gap-2">
              <div className="bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm text-xs">
                {completedInvestments.length} Active Investment
                {completedInvestments.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-2 gap-6">
          <StatsCard
            label="Total Returns Received"
            value={formatCurrency(totalReturns)}
            icon={<DollarSign className="h-4 w-4 text-green-600" />}
          />
          <StatsCard
            label="Pending Returns"
            value={formatCurrency(pendingReturns)}
            icon={<ArrowUpRight className="h-4 w-4 text-blue-600" />}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/transactions">
              View All <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <WalletIcon className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground mb-2">No activity yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Start investing to see your transaction history
              </p>
              <Button asChild>
                <Link to="/discover">Explore Farms</Link>
              </Button>
            </div>
          ) : (
            <DataTable columns={columns} data={transactions.slice(0, 5)} />
          )}
        </div>
      </div>
    </div>
  )
}
