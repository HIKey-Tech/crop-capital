import { createFileRoute } from '@tanstack/react-router'
import {
  Activity,
  Banknote,
  Building2,
  CheckCircle,
  Coins,
  Download,
  FileX2,
  LandPlot,
  ListChecks,
  Pencil,
  ShieldCheck,
  ShieldX,
  Trash2,
  TrendingUp,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { LucideIcon } from 'lucide-react'

import type { ActivityType, UserWithStats } from '@/types'

import { StatsCard } from '@/components/dashboard/stats-card'
import { DataTable } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { useTenant } from '@/contexts/tenant'
import { useActivities, useFarms, useUserStats, useUsers } from '@/hooks'
import { exportToCSV } from '@/lib/export-csv'
import { formatDate } from '@/lib/format-date'

export const Route = createFileRoute('/$tenant/_authenticated/admin/reports')({
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
  const { tenant } = useTenant()
  const { data: usersData, isLoading: usersLoading } = useUsers()
  const { data: statsData, isLoading: statsLoading } = useUserStats()
  const { data: farmsData, isLoading: farmsLoading } = useFarms()
  const { data: activityData, isLoading: activityLoading } = useActivities({
    limit: 10,
  })

  const users = usersData?.users ?? []
  const stats = statsData?.stats
  const farms = farmsData?.farms ?? []
  const activities = activityData?.activities ?? []

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

  const handleExportTopInvestors = () => {
    const safeName = tenant.displayName.toLowerCase().replace(/[^a-z0-9]/g, '-')
    exportToCSV(
      topInvestors,
      [
        { header: 'Rank', value: (_, i) => i + 1 },
        { header: 'Name', value: (u) => u.name },
        { header: 'Email', value: (u) => u.email },
        { header: 'Total Invested', value: (u) => u.totalInvested },
        { header: 'Active Projects', value: (u) => u.activeProjects },
      ],
      `${safeName}-top-investors-${new Date().toISOString().slice(0, 10)}`,
    )
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 mb-10 animate-fade-in space-y-8">
      <header className="pt-6 pb-2 flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">
          {tenant.displayName} admin · Reports
        </span>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Reports for {tenant.displayName}
        </h1>
        <p className="text-base text-muted-foreground">
          Visualize tenant performance, key numbers, and leading investors for{' '}
          {tenant.displayName}.
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
          <header className="px-6 py-4 border-b border-border flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Top Investors
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportTopInvestors}
              disabled={isLoading || !topInvestors.length}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
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
          {activityLoading ? (
            <div className="p-6 text-center text-muted-foreground">
              Loading...
            </div>
          ) : (
            <>
              <ul className="divide-y divide-border">
                {activities.length > 0 ? (
                  activities.map((activity, idx) => {
                    const style = activityStyles[activity.type]
                    const Icon = style.icon
                    return (
                      <li
                        key={activity._id}
                        className="px-6 py-4 flex items-start gap-4 group transition hover:bg-muted/30"
                        style={{
                          animation: `slide-up 400ms ${idx * 40}ms both`,
                        }}
                      >
                        <span
                          className={`mt-1 shrink-0 rounded-full border border-border p-1.5 ${style.bg}`}
                        >
                          <Icon className={`w-4 h-4 ${style.color}`} />
                        </span>
                        <div className="flex-1">
                          <div className="text-xs text-muted-foreground mb-1">
                            {formatDate(activity.createdAt, {
                              dateStyle: 'medium',
                            })}
                          </div>
                          <div className="font-medium text-foreground">
                            {activity.title}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {activity.description}
                          </div>
                        </div>
                      </li>
                    )
                  })
                ) : (
                  <li className="py-6 text-center text-muted-foreground">
                    No activity to show.
                  </li>
                )}
              </ul>
              {(activityData?.pagination.pages ?? 0) > 1 && (
                <div className="px-6 py-3 border-t border-border">
                  <button className="text-sm text-primary hover:underline font-medium w-full text-center">
                    View All Activity
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}

const activityStyles: Record<
  ActivityType,
  { icon: LucideIcon; bg: string; color: string }
> = {
  user_signup: {
    icon: UserPlus,
    bg: 'bg-primary/10',
    color: 'text-primary',
  },
  tenant_created: {
    icon: Building2,
    bg: 'bg-emerald-100',
    color: 'text-emerald-700',
  },
  tenant_updated: {
    icon: Pencil,
    bg: 'bg-blue-100',
    color: 'text-blue-600',
  },
  tenant_deleted: {
    icon: Trash2,
    bg: 'bg-red-100',
    color: 'text-red-600',
  },
  farm_created: {
    icon: LandPlot,
    bg: 'bg-green-100',
    color: 'text-green-600',
  },
  farm_updated: {
    icon: Pencil,
    bg: 'bg-blue-100',
    color: 'text-blue-600',
  },
  farm_deleted: {
    icon: Trash2,
    bg: 'bg-red-100',
    color: 'text-red-600',
  },
  investment_created: {
    icon: Coins,
    bg: 'bg-amber-100',
    color: 'text-amber-600',
  },
  investment_completed: {
    icon: CheckCircle,
    bg: 'bg-green-100',
    color: 'text-green-600',
  },
  investment_failed: {
    icon: XCircle,
    bg: 'bg-red-100',
    color: 'text-red-600',
  },
  kyc_submitted: {
    icon: FileX2,
    bg: 'bg-blue-100',
    color: 'text-blue-600',
  },
  kyc_approved: {
    icon: ShieldCheck,
    bg: 'bg-green-100',
    color: 'text-green-600',
  },
  kyc_rejected: {
    icon: ShieldX,
    bg: 'bg-red-100',
    color: 'text-red-600',
  },
  roi_paid: {
    icon: TrendingUp,
    bg: 'bg-emerald-100',
    color: 'text-emerald-600',
  },
  user_promoted_to_admin: {
    icon: ShieldCheck,
    bg: 'bg-cyan-100',
    color: 'text-cyan-700',
  },
  user_demoted_to_investor: {
    icon: ShieldX,
    bg: 'bg-orange-100',
    color: 'text-orange-700',
  },
}
