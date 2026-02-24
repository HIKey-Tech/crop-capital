import { Coins, FolderOpen, TrendingUp } from 'lucide-react'

import { FarmCard } from '@/components/dashboard/farm-card'
import { StatsCard } from '@/components/dashboard/stats-card'
import { useDashboardStats, useFarms, useWatchlist } from '@/hooks'
import { formatCurrency } from '@/lib/format-currency'

export function InvestorDashboard() {
  const { data: farmsResponse, isLoading: farmsLoading } = useFarms()
  const { data: statsResponse, isLoading: statsLoading } = useDashboardStats()
  const { data: watchlistResponse, isLoading: watchlistLoading } =
    useWatchlist()

  const featuredFarms = farmsResponse?.farms.slice(0, 6) || []
  const watchlistFarms = watchlistResponse?.watchlist || []

  const {
    totalInvested = 0,
    activeProjects = 0,
    roiEarned = 0,
  } = statsResponse?.stats || {}

  if (farmsLoading || statsLoading || watchlistLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto p-4">
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

      {watchlistFarms.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">
            My Watchlist
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {watchlistFarms.map((farm, index) => (
              <div
                key={farm._id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <FarmCard farm={farm} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold text-foreground mb-4">Recent Farms</h2>
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
  )
}
