import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowUpRight,
  DollarSign,
  Landmark,
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

export const Route = createFileRoute('/$tenant/_authenticated/wallet/')({
  component: WalletPage,
})

interface WalletTransaction {
  id: string
  date: string
  type: string
  ref: string
  amount: number
  currency?: Investment['currency']
  status: string
  investmentId: string
}

function getReturnAmount(inv: Investment) {
  return inv.projectedReturn
    ? inv.projectedReturn - inv.amount
    : inv.amount * (inv.roi / 100)
}

function summarizeAmounts(
  investments: Array<Investment>,
  selector: (investment: Investment) => number,
) {
  const currencies = Array.from(
    new Set(investments.map((investment) => investment.currency)),
  )

  if (investments.length === 0) {
    return {
      value: formatCurrency(0),
      description: 'No recorded activity yet',
    }
  }

  if (currencies.length === 1) {
    const currency = currencies[0]
    const total = investments.reduce(
      (sum, investment) => sum + selector(investment),
      0,
    )

    return {
      value: formatCurrency(total, currency),
      description: `All amounts shown in ${currency}`,
    }
  }

  return {
    value: 'Multiple currencies',
    description: currencies.join(' · '),
  }
}

const getColumns = (tenant: string): Array<ColumnDef<WalletTransaction>> => [
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
        to="/$tenant/investments/$id"
        params={{ tenant, id: row.original.investmentId }}
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
      const isPositive = tx.type !== 'Investment'
      return (
        <span
          className={
            isPositive ? 'font-medium text-primary' : 'text-foreground'
          }
        >
          {isPositive ? '+' : '-'}
          {formatCurrency(Math.abs(tx.amount), tx.currency)}
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
            ? 'bg-secondary text-secondary-foreground'
            : 'bg-accent text-accent-foreground'
        }`}
      >
        {getValue() as string}
      </span>
    ),
  },
]

function WalletPage() {
  const { tenant } = Route.useParams()
  const { data, isLoading, error } = useMyInvestments()
  const columns = getColumns(tenant)

  const investments = data?.investments || []
  const completedInvestments = investments.filter(
    (inv: Investment) => inv.status === 'completed',
  )

  const paidReturnInvestments = completedInvestments.filter(
    (inv: Investment) => inv.roiPaid,
  )
  const pendingReturnInvestments = completedInvestments.filter(
    (inv: Investment) => !inv.roiPaid,
  )

  const investedSummary = summarizeAmounts(
    completedInvestments,
    (investment) => investment.amount,
  )
  const paidReturnsSummary = summarizeAmounts(
    paidReturnInvestments,
    getReturnAmount,
  )
  const pendingReturnsSummary = summarizeAmounts(
    pendingReturnInvestments,
    getReturnAmount,
  )

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
        currency: inv.currency,
        status: inv.status,
        investmentId: inv._id,
      })

      if (inv.roiPaid) {
        const roiAmount = getReturnAmount(inv)
        txs.push({
          id: `${inv._id}-roi`,
          date: inv.updatedAt,
          type: 'Bank Return Payout',
          ref: `ROI-${inv._id.slice(-8).toUpperCase()}`,
          amount: roiAmount,
          currency: inv.currency,
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
        <p className="text-muted-foreground">Failed to load returns data</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Returns</h1>
          <p className="text-muted-foreground">
            Track funded capital, expected returns, and bank payouts from your
            investments.
          </p>
        </div>
        <Button asChild className="btn-primary-gradient">
          <Link to="/$tenant/farms" params={{ tenant }}>
            <TrendingUp className="h-4 w-4 mr-2" /> Invest Now
          </Link>
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className="relative overflow-hidden rounded-2xl p-6 text-secondary-foreground shadow-lg md:col-span-1"
          style={{ background: 'var(--gradient-secondary)' }}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <WalletIcon className="h-32 w-32" />
          </div>
          <div className="relative z-10">
            <p className="mb-1 text-sm font-medium text-secondary-foreground/80">
              Funded Capital
            </p>
            <h2 className="text-4xl font-bold mb-6">{investedSummary.value}</h2>
            <div className="flex gap-2">
              <div className="bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm text-xs">
                {completedInvestments.length} Completed Investment
                {completedInvestments.length !== 1 ? 's' : ''}
              </div>
            </div>
            <p className="mt-3 text-xs text-secondary-foreground/80">
              {investedSummary.description}
            </p>
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-2 gap-6">
          <StatsCard
            label="Paid to Bank"
            value={paidReturnsSummary.value}
            icon={<DollarSign className="h-4 w-4 text-primary" />}
            description={paidReturnsSummary.description}
          />
          <StatsCard
            label="Pending Bank Payouts"
            value={pendingReturnsSummary.value}
            icon={<Landmark className="h-4 w-4 text-secondary" />}
            description={pendingReturnsSummary.description}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/$tenant/transactions" params={{ tenant }}>
              View All <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <WalletIcon className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground mb-2">No activity yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Start investing to see your returns and payout history
              </p>
              <Button asChild>
                <Link to="/$tenant/farms" params={{ tenant }}>
                  Explore Farms
                </Link>
              </Button>
            </div>
          ) : (
            <div className="p-4">
              <DataTable columns={columns} data={transactions.slice(0, 5)} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
