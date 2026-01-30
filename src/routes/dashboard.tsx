import { createFileRoute } from '@tanstack/react-router'
import { Coins, FolderOpen, TrendingUp } from 'lucide-react'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { FarmCard } from '@/components/dashboard/farm-card'
import { StatsCard } from '@/components/dashboard/stats-card'
import { useFarms, useMyInvestments } from '@/hooks'
import { formatCurrency } from '@/lib/format-currency'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { data: farmsResponse, isLoading: farmsLoading } = useFarms()
  const { data: investmentsResponse, isLoading: investmentsLoading } =
    useMyInvestments()

  const featuredFarms = farmsResponse?.farms.slice(0, 6) || []

  // Calculate stats from real data
  const investments = investmentsResponse?.investments || []
  const totalInvested =
    investments.reduce((sum, inv) => sum + inv.amount, 0) || 0
  const activeProjects =
    investments.filter((inv) => inv.status === 'completed').length || 0
  const roiEarned =
    investments.reduce(
      (sum, inv) => sum + (inv.roiPaid ? inv.projectedReturn - inv.amount : 0),
      0,
    ) || 0

  if (farmsLoading || investmentsLoading) {
    return (
      <DashboardLayout userRole="investor">
        <div className="flex items-center justify-center h-64">
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="investor">
      <div className="space-y-8 animate-fade-in">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            label="Total Invested"
            value={formatCurrency(totalInvested)}
            trend=""
            trendLabel=""
            icon={<TrendingUp className="w-4 h-4 text-primary" />}
          />
          <StatsCard
            label="Active Projects"
            value={activeProjects.toString()}
            trend=""
            trendLabel=""
            icon={<FolderOpen className="w-4 h-4 text-primary" />}
          />
          <StatsCard
            label="ROI Earned"
            value={formatCurrency(roiEarned)}
            trend=""
            trendLabel=""
            icon={<Coins className="w-4 h-4 text-primary" />}
          />
        </div>

        {/* Recent Farms */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">
            Recent Farms
          </h2>
          {featuredFarms.length === 0 ? (
            <p className="text-muted-foreground">No farms available yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredFarms.map((farm, index) => (
                <div
                  key={farm._id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <FarmCard farm={farm} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}
