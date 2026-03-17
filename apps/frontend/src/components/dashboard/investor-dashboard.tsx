import { Link, useParams } from '@tanstack/react-router'
import { Coins, FolderOpen, TrendingUp } from 'lucide-react'

import { FarmCard } from '@/components/dashboard/farm-card'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Button } from '@/components/ui/button'
import { useTenant } from '@/contexts/tenant'
import { useDashboardStats, useFarms, useWatchlist } from '@/hooks'
import { formatCurrency } from '@/lib/format-currency'

export function InvestorDashboard() {
  const params = useParams({ strict: false })
  const { tenant } = useTenant()
  const { data: farmsResponse, isLoading: farmsLoading } = useFarms()
  const { data: statsResponse, isLoading: statsLoading } = useDashboardStats()
  const { data: watchlistResponse, isLoading: watchlistLoading } =
    useWatchlist()
  const tenantParam = params.tenant ?? tenant.slug

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
      <section className="rounded-3xl border border-border bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.16),transparent_34%),linear-gradient(160deg,hsl(var(--card)),hsl(var(--muted))_58%,hsl(var(--card)))] p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Investor workspace
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {tenant.heroTitle}
            </h1>
            <p className="text-base text-muted-foreground">{tenant.tagline}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="btn-primary-gradient">
              <Link to="/$tenant/farms" params={{ tenant: tenantParam }}>
                {tenant.ctaSecondaryLabel}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/$tenant/investments" params={{ tenant: tenantParam }}>
                View My Investments
              </Link>
            </Button>
          </div>
        </div>
      </section>

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
            My Watchlist at {tenant.displayName}
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
        <h2 className="text-xl font-bold text-foreground mb-4">
          Recent Farms from {tenant.displayName}
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
  )
}
