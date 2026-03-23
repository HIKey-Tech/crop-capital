import { Link, createFileRoute } from '@tanstack/react-router'
import {
  Activity,
  ArrowLeft,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
} from 'lucide-react'

import type { Farm, Investment, User } from '@/types'
import { Button } from '@/components/ui/button'
import { StatsCard } from '@/components/dashboard/stats-card'
import { LoadingSpinner } from '@/components/ui/loading'
import { useAllInvestments, useFarm } from '@/hooks'
import { formatCurrency } from '@/lib/format-currency'
import { formatDate } from '@/lib/format-date'

export const Route = createFileRoute(
  '/$tenant/_authenticated/admin/farms/$id/analytics',
)({
  component: FarmAnalyticsPage,
})

function FarmAnalyticsPage() {
  const { id, tenant } = Route.useParams()
  const { data: farmData, isLoading: farmLoading } = useFarm(id)
  const { data: investmentsData, isLoading: investmentsLoading } =
    useAllInvestments()

  const isLoading = farmLoading || investmentsLoading

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!farmData?.farm) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-muted-foreground">Farm not found</p>
        <Button asChild>
          <Link to="/$tenant/admin/farms" params={{ tenant }}>
            Back to Farms
          </Link>
        </Button>
      </div>
    )
  }

  const farm = farmData.farm
  const currency = farm.currency || 'NGN'
  const allInvestments = investmentsData?.investments || []

  // Filter investments for this farm
  const farmInvestments = allInvestments.filter((inv: Investment) => {
    const invFarm = inv.farm as Farm
    return invFarm._id === id || (inv.farm as string) === id
  })

  // Calculate analytics from real data
  const completedInvestments = farmInvestments.filter(
    (inv: Investment) => inv.status === 'completed',
  )
  const totalRaised = completedInvestments.reduce(
    (sum: number, inv: Investment) => sum + inv.amount,
    0,
  )
  const uniqueInvestors = new Set(
    completedInvestments.map((inv: Investment) => {
      const investor = inv.investor as User
      return investor.email || investor
    }),
  )
  const investorsCount = uniqueInvestors.size
  const avgInvestment = investorsCount > 0 ? totalRaised / investorsCount : 0

  // Calculate funding percentage
  const fundingPercentage =
    farm.investmentGoal > 0 ? (totalRaised / farm.investmentGoal) * 100 : 0

  // Group investments by date for velocity chart
  const investmentsByDate = completedInvestments.reduce(
    (acc: Record<string, number>, inv: Investment) => {
      const date = new Date(inv.createdAt).toLocaleDateString()
      acc[date] = (acc[date] || 0) + inv.amount
      return acc
    },
    {} as Record<string, number>,
  )

  // Get last 12 data points for chart
  const dates = Object.keys(investmentsByDate).slice(-12)
  const maxAmount = Math.max(...Object.values(investmentsByDate), 1)

  // Derive farm status based on funding progress
  const isFunded = totalRaised >= farm.investmentGoal
  const farmStatus = isFunded ? 'Funded' : 'Open'

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div className="flex gap-4 items-center">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/$tenant/admin/farms" params={{ tenant }}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Analytics: {farm.name}
            </h1>
            <p className="text-muted-foreground text-sm">
              Performance metrics and investor insights
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          label="Total Raised"
          value={formatCurrency(totalRaised, currency)}
          icon={<DollarSign className="w-5 h-5 text-primary" />}
          description={`${fundingPercentage.toFixed(0)}% of ${formatCurrency(farm.investmentGoal, currency)} goal`}
        />
        <StatsCard
          label="Total Investors"
          value={investorsCount.toString()}
          icon={<Users className="w-5 h-5 text-primary" />}
          description={`${completedInvestments.length} investments`}
        />
        <StatsCard
          label="Avg Investment"
          value={formatCurrency(avgInvestment, currency)}
          icon={<TrendingUp className="w-5 h-5 text-primary" />}
          description="Per investor"
        />
        <StatsCard
          label="Farm Status"
          value={farmStatus}
          icon={<Activity className="w-5 h-5 text-primary" />}
          description={`${farm.durationMonths} month investment`}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funding Velocity Chart */}
        <div className="bg-card border rounded-xl p-6">
          <h3 className="font-semibold mb-6">Funding Velocity (Daily)</h3>
          {dates.length > 0 ? (
            <>
              <div className="h-64 flex items-end gap-2 justify-between px-2">
                {dates.map((date, i) => {
                  const amount = investmentsByDate[date] || 0
                  const height = (amount / maxAmount) * 100
                  return (
                    <div
                      key={i}
                      className="w-full bg-green-100 rounded-t hover:bg-green-200 transition-colors relative group h-full"
                    >
                      <div
                        className="absolute bottom-0 w-full bg-green-500 rounded-t transition-all"
                        style={{ height: `${height}%` }}
                      />
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-14 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10">
                        {formatCurrency(amount, currency)}
                        <br />
                        {date}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                <span>{dates[0]}</span>
                {dates.length > 1 && <span>{dates[dates.length - 1]}</span>}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No investment data yet
            </div>
          )}
        </div>

        {/* Investment Summary */}
        <div className="bg-card border rounded-xl p-6">
          <h3 className="font-semibold mb-6">Investment Summary</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Funding Progress</span>
                <span className="font-medium">
                  {fundingPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
                />
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Investment Goal</span>
                <span className="font-medium">
                  {formatCurrency(farm.investmentGoal, currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Raised</span>
                <span className="font-medium text-green-700">
                  {formatCurrency(totalRaised, currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining to Goal</span>
                <span className="font-medium">
                  {formatCurrency(
                    Math.max(0, farm.investmentGoal - totalRaised),
                    currency,
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ROI Rate</span>
                <span className="font-medium">{farm.roi}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">
                  {farm.durationMonths} months
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Investments */}
      <div className="bg-card border rounded-xl p-6">
        <h3 className="font-semibold mb-4">Recent Investments</h3>
        {completedInvestments.length > 0 ? (
          <div className="space-y-3">
            {completedInvestments.slice(0, 5).map((inv: Investment) => {
              const investor = inv.investor as User
              return (
                <div
                  key={inv._id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {investor.name || 'Investor'}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(inv.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {formatCurrency(inv.amount, currency)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      +{inv.roi}% ROI
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No investments yet for this farm
          </p>
        )}
      </div>
    </div>
  )
}
