import { createFileRoute } from '@tanstack/react-router'
import { DollarSign, ShieldCheck, Users } from 'lucide-react'
import { toast } from 'sonner'
import type { ColumnDef } from '@tanstack/react-table'

import type { UserWithStats } from '@/types'

import { StatsCard } from '@/components/dashboard/stats-card'
import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  useCurrentUser,
  useDemoteUser,
  usePromoteUser,
  useUserStats,
  useUsers,
} from '@/hooks'
import { formatDate } from '@/lib/format-date'
import { formatCurrency } from '@/lib/format-currency'

export const Route = createFileRoute('/$tenant/_authenticated/admin/investors')(
  {
    component: AdminInvestorPage,
  },
)

function AdminInvestorPage() {
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useUsers()
  const { data: statsData, isLoading: statsLoading } = useUserStats()
  const { data: currentUserData } = useCurrentUser()
  const promoteUser = usePromoteUser()
  const demoteUser = useDemoteUser()

  const users = usersData?.users ?? []
  const stats = statsData?.stats
  const currentUser = currentUserData?.user

  const handlePromote = async (user: UserWithStats) => {
    try {
      await promoteUser.mutateAsync(user._id)
      toast.success(`${user.name} can now access the tenant admin portal`)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to promote user'
      toast.error(message)
    }
  }

  const handleDemote = async (user: UserWithStats) => {
    try {
      await demoteUser.mutateAsync(user._id)
      toast.success(`${user.name} has been moved back to investor access`)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to demote user'
      toast.error(message)
    }
  }

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
      accessorKey: 'role',
      header: 'Access',
      cell: ({ row }) => {
        const isCurrentAdmin = row.original._id === currentUser?._id

        if (row.original.role === 'admin') {
          return (
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border border-amber-500 px-2 py-1 text-amber-700 bg-amber-100/80 rounded-full font-medium text-xs">
                Tenant admin
              </Badge>
              {isCurrentAdmin ? (
                <Badge className="border border-blue-500 px-2 py-1 text-blue-700 bg-blue-100/80 rounded-full font-medium text-xs">
                  You
                </Badge>
              ) : null}
            </div>
          )
        }

        return (
          <Badge className="border border-zinc-400 px-2 py-1 text-zinc-700 bg-zinc-100/80 rounded-full font-medium text-xs">
            Investor
          </Badge>
        )
      },
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
      cell: ({ getValue }) => (
        <span>{formatCurrency(getValue() as number)}</span>
      ),
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
      id: 'activity',
      header: 'Activity',
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
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }) => {
        const isAdmin = row.original.role === 'admin'
        const isCurrentAdmin = row.original._id === currentUser?._id
        const isPromoting =
          promoteUser.isPending && promoteUser.variables === row.original._id
        const isDemoting =
          demoteUser.isPending && demoteUser.variables === row.original._id

        if (isAdmin) {
          return (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isCurrentAdmin || isDemoting}
              onClick={() => handleDemote(row.original)}
            >
              {isCurrentAdmin
                ? 'Current admin'
                : isDemoting
                  ? 'Updating...'
                  : 'Demote to Investor'}
            </Button>
          )
        }

        return (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={isPromoting}
            onClick={() => handlePromote(row.original)}
          >
            {isPromoting ? 'Updating...' : 'Promote to Admin'}
          </Button>
        )
      },
    },
  ]

  if (usersError) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500">
          Failed to load investors. Please try again.
        </p>
      </div>
    )
  }

  const adminUsers = users.filter((user) => user.role === 'admin')
  const totalVolume =
    stats?.totalVolume ??
    users.reduce((sum, user) => sum + user.totalInvested, 0)
  const activeInvestors =
    stats?.activeInvestors ??
    users.filter((user) => user.role === 'investor' && user.activeProjects > 0)
      .length

  return (
    <div className="space-y-8 animate-fade-in max-w-screen-2xl mx-auto px-4 mb-10">
      <header className="pt-3 mb-2 flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Tenant Users
        </h1>
        <p className="text-base text-muted-foreground">
          Review investors, promote trusted operators to tenant admin access,
          and keep the tenancy team current.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          label="Total Users"
          value={users.length.toLocaleString()}
          icon={<Users className="w-5 h-5 text-primary" />}
        />
        <StatsCard
          label="Tenant Admins"
          value={adminUsers.length.toLocaleString()}
          icon={<ShieldCheck className="w-5 h-5 text-primary" />}
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
          data={users}
          loading={usersLoading || statsLoading}
          searchPlaceholder="Search by name, email, or access level..."
          pageSize={10}
        />
      </div>
    </div>
  )
}
