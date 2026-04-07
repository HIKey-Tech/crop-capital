import { createFileRoute } from '@tanstack/react-router'
import { Check, DollarSign, Users } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

import type { Farm, Investment, User } from '@/types'

import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { StatsCard } from '@/components/dashboard/stats-card'
import { useTenant } from '@/contexts/tenant'
import { LoadingSpinner } from '@/components/ui/loading'
import { useAllInvestments } from '@/hooks'
import { formatCurrency } from '@/lib/format-currency'
import { formatDate } from '@/lib/format-date'

export const Route = createFileRoute('/$tenant/_authenticated/admin/payouts')({
  component: PayoutsPage,
})

interface PayoutRow {
  id: string
  investorName: string
  investorEmail: string
  farmName: string
  amount: number
  currency: Investment['currency']
  roi: number
  projectedReturn: number
  status: 'pending' | 'paid'
  investmentDate: string
  durationMonths: number
}

function summarizePayouts(
  rows: Array<PayoutRow>,
  selector: (row: PayoutRow) => number,
) {
  const currencies = Array.from(
    new Set(rows.map((row) => row.currency || 'NGN')),
  )

  if (rows.length === 0) {
    return {
      value: formatCurrency(0),
      description: 'No payout activity yet',
    }
  }

  if (currencies.length === 1) {
    const currency = currencies[0]
    const total = rows.reduce((sum, row) => sum + selector(row), 0)
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

const columns: Array<ColumnDef<PayoutRow>> = [
  {
    accessorKey: 'investmentDate',
    header: 'Investment Date',
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
  {
    accessorKey: 'investorName',
    header: 'Investor',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.investorName}</div>
        <div className="text-xs text-muted-foreground">
          {row.original.investorEmail}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'farmName',
    header: 'Farm',
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: 'amount',
    header: 'Investment',
    cell: ({ row }) => (
      <span className="font-medium">
        {formatCurrency(row.original.amount, row.original.currency)}
      </span>
    ),
  },
  {
    accessorKey: 'projectedReturn',
    header: 'Payout Amount',
    cell: ({ row }) => (
      <div>
        <div className="font-bold text-green-700">
          {formatCurrency(row.original.projectedReturn, row.original.currency)}
        </div>
        <div className="text-xs text-muted-foreground">
          +{row.original.roi}% ROI
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue() as string
      return (
        <Badge
          variant="outline"
          className={`capitalize ${
            status === 'paid'
              ? 'border-green-500 text-green-700 bg-green-50'
              : 'border-yellow-500 text-yellow-700 bg-yellow-50'
          }`}
        >
          {status === 'paid' ? (
            <span className="flex items-center gap-1">
              <Check className="h-3 w-3" /> Paid
            </span>
          ) : (
            'Pending'
          )}
        </Badge>
      )
    },
  },
]

function PayoutsPage() {
  const { tenant } = useTenant()
  const { data, isLoading } = useAllInvestments()

  if (isLoading) {
    return <LoadingSpinner />
  }

  const investments = data?.investments || []

  // Filter completed investments (these are eligible for payouts)
  const completedInvestments = investments.filter(
    (inv: Investment) => inv.status === 'completed',
  )

  // Transform to payout rows
  const payoutRows: Array<PayoutRow> = completedInvestments.map(
    (inv: Investment) => {
      const farm = inv.farm as Farm
      const investor = inv.investor as User

      return {
        id: inv._id,
        investorName: investor.name || 'Unknown',
        investorEmail: investor.email || '',
        farmName: farm.name || 'Unknown Farm',
        amount: inv.amount,
        currency: inv.currency,
        roi: inv.roi,
        projectedReturn:
          inv.projectedReturn || inv.amount * (1 + inv.roi / 100),
        status: inv.roiPaid ? 'paid' : 'pending',
        investmentDate: inv.createdAt,
        durationMonths: inv.durationMonths,
      } satisfies PayoutRow
    },
  )

  // Calculate stats
  const pendingPayouts = payoutRows.filter((p) => p.status === 'pending')
  const paidPayouts = payoutRows.filter((p) => p.status === 'paid')

  const pendingSummary = summarizePayouts(
    pendingPayouts,
    (payout) => payout.projectedReturn,
  )
  const paidSummary = summarizePayouts(
    paidPayouts,
    (payout) => payout.projectedReturn,
  )
  const averageSummary = summarizePayouts(
    payoutRows,
    (payout) => payout.projectedReturn / payoutRows.length,
  )

  return (
    <div className="space-y-6 animate-fade-in max-w-screen-2xl mx-auto">
      <div>
        <div className="text-xs text-muted-foreground uppercase tracking-[0.16em]">
          {tenant.displayName} admin · Bank payouts
        </div>
        <h1 className="text-2xl font-bold">
          Bank Payouts for {tenant.displayName}
        </h1>
        <p className="text-muted-foreground">
          Track direct bank payouts owed to investors inside{' '}
          {tenant.displayName}.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          label="Pending Payouts"
          value={pendingPayouts.length.toString()}
          icon={<DollarSign className="w-5 h-5 text-yellow-600" />}
          description={`${pendingSummary.value} total${pendingSummary.description ? ` · ${pendingSummary.description}` : ''}`}
        />
        <StatsCard
          label="Completed Payouts"
          value={paidPayouts.length.toString()}
          icon={<Check className="w-5 h-5 text-green-600" />}
          description={`${paidSummary.value} paid out${paidSummary.description ? ` · ${paidSummary.description}` : ''}`}
        />
        <StatsCard
          label="Total Investors"
          value={new Set(
            payoutRows.map((p) => p.investorEmail),
          ).size.toString()}
          icon={<Users className="w-5 h-5 text-blue-600" />}
          description="With active investments"
        />
        <StatsCard
          label="Average Payout"
          value={averageSummary.value}
          icon={<DollarSign className="w-5 h-5 text-primary" />}
          description={
            averageSummary.description
              ? `Per investment · ${averageSummary.description}`
              : 'Per investment'
          }
        />
      </div>

      {/* Payouts Table */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold">All Payouts</h3>
        </div>
        {payoutRows.length > 0 ? (
          <div className="p-4">
            <DataTable
              columns={columns}
              data={payoutRows}
              searchPlaceholder="Search investor or farm..."
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <DollarSign className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No bank payouts to display</p>
            <p className="text-sm text-muted-foreground">
              Bank payouts will appear when investments are completed
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
