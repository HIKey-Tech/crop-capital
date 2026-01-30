import { createFileRoute } from '@tanstack/react-router'
import { Check, DollarSign, Users } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

import type { Farm, Investment, User } from '@/types'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { StatsCard } from '@/components/dashboard/stats-card'
import { LoadingSpinner } from '@/components/ui/loading'
import { useAllInvestments } from '@/hooks'
import { formatCurrency } from '@/lib/format-currency'
import { formatDate } from '@/lib/format-date'

export const Route = createFileRoute('/admin/payouts')({
  component: PayoutsPage,
})

interface PayoutRow {
  id: string
  investorName: string
  investorEmail: string
  farmName: string
  amount: number
  roi: number
  projectedReturn: number
  status: 'pending' | 'paid'
  investmentDate: string
  durationMonths: number
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
    cell: ({ getValue }) => (
      <span className="font-medium">
        {formatCurrency(getValue() as number)}
      </span>
    ),
  },
  {
    accessorKey: 'projectedReturn',
    header: 'Payout Amount',
    cell: ({ row }) => (
      <div>
        <div className="font-bold text-green-700">
          {formatCurrency(row.original.projectedReturn)}
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
  const { data, isLoading } = useAllInvestments()

  if (isLoading) {
    return (
      <DashboardLayout userRole="admin">
        <LoadingSpinner />
      </DashboardLayout>
    )
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

  const totalPendingAmount = pendingPayouts.reduce(
    (sum, p) => sum + p.projectedReturn,
    0,
  )
  const totalPaidAmount = paidPayouts.reduce(
    (sum, p) => sum + p.projectedReturn,
    0,
  )

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6 animate-fade-in max-w-screen-2xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold">Payouts Management</h1>
          <p className="text-muted-foreground">
            Track ROI payouts to investors
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard
            label="Pending Payouts"
            value={pendingPayouts.length.toString()}
            icon={<DollarSign className="w-5 h-5 text-yellow-600" />}
            description={`${formatCurrency(totalPendingAmount)} total`}
          />
          <StatsCard
            label="Completed Payouts"
            value={paidPayouts.length.toString()}
            icon={<Check className="w-5 h-5 text-green-600" />}
            description={`${formatCurrency(totalPaidAmount)} paid out`}
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
            value={formatCurrency(
              payoutRows.length > 0
                ? payoutRows.reduce((sum, p) => sum + p.projectedReturn, 0) /
                    payoutRows.length
                : 0,
            )}
            icon={<DollarSign className="w-5 h-5 text-primary" />}
            description="Per investment"
          />
        </div>

        {/* Payouts Table */}
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold">All Payouts</h3>
          </div>
          {payoutRows.length > 0 ? (
            <DataTable
              columns={columns}
              data={payoutRows}
              searchPlaceholder="Search investor or farm..."
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No payouts to display</p>
              <p className="text-sm text-muted-foreground">
                Payouts will appear when investments are completed
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
