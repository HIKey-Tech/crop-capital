import { Link, createFileRoute } from '@tanstack/react-router'
import { DollarSign, Plus, Users } from 'lucide-react'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Button } from '@/components/ui/button'
import { useUserStats, useUsers } from '@/hooks/use-users'

export const Route = createFileRoute('/admin/investors')({
  component: AdminInvestorPage,
})

function formatCurrency(n: number) {
  return '$' + n.toLocaleString()
}

function AdminInvestorPage() {
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useUsers()
  const { data: statsData, isLoading: statsLoading } = useUserStats()

  const investors = usersData?.users ?? []
  const stats = statsData?.stats

  if (usersLoading || statsLoading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading investors...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (usersError) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center h-96">
          <p className="text-red-500">
            Failed to load investors. Please try again.
          </p>
        </div>
      </DashboardLayout>
    )
  }

  const totalInvestors = stats?.totalUsers ?? investors.length
  const totalVolume =
    stats?.totalVolume ??
    investors.reduce((sum, inv) => sum + inv.totalInvested, 0)
  const activeInvestors =
    stats?.activeInvestors ??
    investors.filter((i) => i.activeProjects > 0).length
  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-8 animate-fade-in max-w-screen-2xl mx-auto px-4 mb-10">
        {/* Page hierarchy */}
        <header className="pt-3 mb-2 flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            All Investors
          </h1>
          <p className="text-base text-muted-foreground">
            Manage and review all users who have invested on the platform.
          </p>
        </header>

        {/* Stats top cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            label="Total Investors"
            value={totalInvestors.toLocaleString()}
            icon={<Users className="w-5 h-5 text-primary" />}
          />
          <StatsCard
            label="Total Volume Invested"
            value={formatCurrency(totalVolume)}
            icon={<DollarSign className="w-5 h-5 text-primary" />}
          />
          <StatsCard
            label="Active Investors"
            value={activeInvestors.toString()}
            icon={<Users className="w-5 h-5 text-primary" />}
          />
        </div>

        {/* Filters + Add button row */}
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col">
              <label
                htmlFor="search"
                className="text-xs text-muted-foreground mb-1"
              >
                Investor
              </label>
              <input
                className="border border-border rounded-lg px-3 py-2 bg-card text-sm focus:outline-none focus:border-primary min-w-[140px]"
                type="text"
                id="search"
                placeholder="Search by name or email"
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="joined-from"
                className="text-xs text-muted-foreground mb-1"
              >
                Joined From
              </label>
              <input
                className="border border-border rounded-lg px-3 py-2 bg-card text-sm focus:outline-none focus:border-primary min-w-30"
                type="date"
                id="joined-from"
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="joined-to"
                className="text-xs text-muted-foreground mb-1"
              >
                Joined To
              </label>
              <input
                className="border border-border rounded-lg px-3 py-2 bg-card text-sm focus:outline-none focus:border-primary min-w-30"
                type="date"
                id="joined-to"
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="status"
                className="text-xs text-muted-foreground mb-1"
              >
                Status
              </label>
              <select
                className="border border-border rounded-lg px-3 py-2 bg-card text-sm focus:outline-none focus:border-primary min-w-27.5"
                id="status"
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <Link to="/admin/investors" className="self-end md:self-auto">
            <Button
              className="flex items-center px-5 h-11 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              style={{ minWidth: 180, fontSize: '1rem' }}
              variant="default"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span>Add New Investor</span>
            </Button>
          </Link>
        </div>

        {/* Investors table section */}
        <section className="bg-card rounded-2xl border border-border overflow-x-auto">
          <header className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Investor Records
            </h2>
          </header>
          <table className="w-full min-w-225">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground">
                  Name
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground">
                  Email
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground">
                  Country
                </th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-muted-foreground">
                  Total Invested
                </th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-muted-foreground">
                  Active Projects
                </th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-muted-foreground">
                  Joined
                </th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {investors.map((inv, idx) => {
                const isActive = inv.activeProjects > 0
                return (
                  <tr
                    key={inv._id}
                    className={
                      'border-t border-border' +
                      (!isActive ? ' opacity-60' : '')
                    }
                    style={{ animationDelay: `${idx * 35}ms` }}
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      {inv.name}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {inv.email}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {inv.country ?? '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {formatCurrency(inv.totalInvested)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {inv.activeProjects}
                    </td>
                    <td className="px-6 py-4 text-center text-muted-foreground">
                      {new Date(inv.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isActive ? (
                        <span className="border border-green-500 px-2 py-1 rounded-full text-xs text-green-700 bg-green-100/80 font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="border border-zinc-400 px-2 py-1 rounded-full text-xs text-zinc-700 bg-zinc-100/80 font-medium">
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>
      </div>
    </DashboardLayout>
  )
}
