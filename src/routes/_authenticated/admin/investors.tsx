import { createFileRoute } from '@tanstack/react-router'
import { DollarSign, Users } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

import type { UserWithStats } from '@/types'

import { StatsCard } from '@/components/dashboard/stats-card'
import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { useUserStats, useUsers } from '@/hooks'
import { formatDate } from '@/lib/format-date'
import { formatCurrency } from '@/lib/format-currency'

export const Route = createFileRoute('/_authenticated/admin/investors')({
  component: AdminInvestorPage,
})

const columns: Array<ColumnDef<UserWithStats>> = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ getValue }) => (
      <span className="font-medium text-foreground">
        {getValue() as string}
      </span>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: 'country',
    header: 'Country',
    cell: ({ getValue }) => {
      const country = getValue() as string | undefined
      return <span className="text-muted-foreground">{country ?? '-'}</span>
    },
  },
  {
    accessorKey: 'totalInvested',
    header: 'Total Invested',
    cell: ({ getValue }) => <span>{formatCurrency(getValue() as number)}</span>,
  },
  {
    accessorKey: 'activeProjects',
    header: 'Active Projects',
    cell: ({ getValue }) => <span>{getValue() as number}</span>,
  },
  {
    accessorKey: 'createdAt',
    header: 'Joined',
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">
        {formatDate(getValue() as string)}
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.original.activeProjects > 0
      return isActive ? (
        <Badge className="border border-green-500 px-2 py-1 text-green-700 bg-green-100/80 rounded-full font-medium text-xs">
          Active
        </Badge>
      ) : (
        <Badge className="border border-zinc-400 px-2 py-1 text-zinc-700 bg-zinc-100/80 rounded-full font-medium text-xs">
          Inactive
        </Badge>
      )
    },
  },
]

function AdminInvestorPage() {
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useUsers()
  const { data: statsData, isLoading: statsLoading } = useUserStats()

  const investors = usersData?.users ?? []
  const stats = statsData?.stats

  if (usersError) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500">
          Failed to load investors. Please try again.
        </p>
      </div>
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
    <div className="space-y-8 animate-fade-in max-w-screen-2xl mx-auto px-4 mb-10">
      <header className="pt-3 mb-2 flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          All Investors
        </h1>
        <p className="text-base text-muted-foreground">
          Manage and review all users who have invested on the platform.
        </p>
      </header>

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

      <div className="p-4">
        <DataTable
          columns={columns}
          data={investors}
          loading={usersLoading || statsLoading}
          searchPlaceholder="Search by name or email..."
          pageSize={10}
        />
      </div>
    </div>
  )
}
