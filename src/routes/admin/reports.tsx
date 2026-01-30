import { createFileRoute } from '@tanstack/react-router'
import { Activity, Banknote, ListChecks, TrendingUp, Users } from 'lucide-react'
import type {ColumnDef} from '@tanstack/react-table';

import type { UserWithStats } from '@/types'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCard } from '@/components/dashboard/stats-card'
import { DataTable } from '@/components/data-table'
import { useFarms, useUserStats, useUsers } from '@/hooks'
import { formatDate } from '@/lib/format-date'

export const Route = createFileRoute('/admin/reports')({
  component: AdminReportsPage,
})

function formatCurrency(num: number) {
  return '₦' + num.toLocaleString('en-NG', { minimumFractionDigits: 0 })
}

const topInvestorColumns: Array<ColumnDef<UserWithStats>> = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <span className="font-medium text-foreground flex gap-2 items-center">
        <span className="rounded bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
          #{row.index + 1}
        </span>
        {row.original.name}
      </span>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ getValue }) => (
      <span className="text-muted-foreground truncate">
        {getValue() as string}
      </span>
    ),
  },
  {
    accessorKey: 'totalInvested',
    header: 'Total Invested',
    cell: ({ getValue }) => <span>{formatCurrency(getValue() as number)}</span>,
  },
  {
    accessorKey: 'activeProjects',
    header: 'Projects',
    cell: ({ getValue }) => <span>{getValue() as number}</span>,
  },
]

function AdminReportsPage() {
  const { data: usersData, isLoading: usersLoading } = useUsers()
  const { data: statsData, isLoading: statsLoading } = useUserStats()
  const { data: farmsData, isLoading: farmsLoading } = useFarms()

  const users = usersData?.users ?? []
  const stats = statsData?.stats
  const farms = farmsData?.farms ?? []

  const isLoading = usersLoading || statsLoading || farmsLoading

  // Sort users by totalInvested descending to get top investors
  const topInvestors = [...users]
    .sort((a, b) => b.totalInvested - a.totalInvested)
    .slice(0, 10)

  // Calculate stats from real data
  const totalAmountInvested =
    stats?.totalVolume ?? users.reduce((sum, u) => sum + u.totalInvested, 0)
  const totalInvestors = stats?.totalUsers ?? users.length
  const opportunitiesCreated = farms.length
  // Platform revenue could be a percentage of total invested (e.g., 5%)
  const platformRevenue = Math.round(totalAmountInvested * 0.05)

  // Recent activity - derive from farms and users data
  const recentUsers = [...users]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 4)

  return (
    <DashboardLayout userRole="admin">
      <div className="max-w-screen-2xl mx-auto px-4 mb-10 animate-fade-in space-y-8">
        <header className="pt-6 pb-2 flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Admin » Reports</span>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Reports & Platform Analytics
          </h1>
          <p className="text-base text-muted-foreground">
            Visualize platform performance, key numbers, and leading investors.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            label="Total Amount Invested"
            value={formatCurrency(totalAmountInvested)}
            icon={<Banknote className="w-4 h-4 text-primary" />}
          />
          <StatsCard
            label="Total Investors"
            value={totalInvestors.toString()}
            icon={<Users className="w-4 h-4 text-primary" />}
          />
          <StatsCard
            label="Opportunities Created"
            value={opportunitiesCreated.toString()}
            icon={<ListChecks className="w-4 h-4 text-primary" />}
          />
          <StatsCard
            label="Platform Revenue"
            value={formatCurrency(platformRevenue)}
            icon={<Activity className="w-4 h-4 text-primary" />}
          />
        </section>

        <div className="flex flex-col lg:flex-row gap-8">
          <section className="flex-1 bg-card rounded-xl border border-border overflow-hidden">
            <header className="px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Top Investors
              </h2>
            </header>
            <div className="p-4">
              <DataTable
                columns={topInvestorColumns}
                data={topInvestors}
                loading={isLoading}
                searchPlaceholder="Search investors..."
                pageSize={5}
                enableColumnVisibility={false}
              />
            </div>
          </section>

          <section className="w-full max-w-md lg:max-w-xs shrink-0 bg-card rounded-xl border border-border">
            <header className="px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Recent Activity
              </h2>
            </header>
            {isLoading ? (
              <div className="p-6 text-center text-muted-foreground">
                Loading...
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recentUsers.length > 0 ? (
                  recentUsers.map((user, idx) => (
                    <li
                      key={user._id}
                      className="px-6 py-4 flex items-start gap-4 group transition hover:bg-muted/30"
                      style={{ animation: `slide-up 400ms ${idx * 40}ms both` }}
                    >
                      <span className="mt-1 shrink-0 rounded-full border border-border p-1.5 bg-primary/10">
                        <Users className="w-4 h-4 text-primary" />
                      </span>
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground mb-1">
                          {formatDate(user.createdAt, { dateStyle: 'medium' })}
                        </div>
                        <div className="font-medium text-foreground">
                          New Investor
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.name} joined the platform
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="py-6 text-center text-muted-foreground">
                    No activity to show.
                  </li>
                )}

                {farms.slice(0, 2).map((farm, idx) => (
                  <li
                    key={farm._id}
                    className="px-6 py-4 flex items-start gap-4 group transition hover:bg-muted/30"
                    style={{
                      animation: `slide-up 400ms ${(recentUsers.length + idx) * 40}ms both`,
                    }}
                  >
                    <span className="mt-1 shrink-0 rounded-full border border-border p-1.5 bg-green-100">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </span>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">
                        {formatDate(farm.createdAt, { dateStyle: 'medium' })}
                      </div>
                      <div className="font-medium text-foreground">
                        New Opportunity
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {farm.name} was created
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}
