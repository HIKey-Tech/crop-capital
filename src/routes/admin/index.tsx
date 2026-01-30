import { Link, createFileRoute } from '@tanstack/react-router'
import {
  Coins,
  FolderOpen,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import type {ColumnDef} from '@tanstack/react-table';

import type { Farm } from '@/types'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCard } from '@/components/dashboard/stats-card'
import { DataTable } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useFarms } from '@/hooks'

export const Route = createFileRoute('/admin/')({
  component: AdminDashboardPage,
})

function formatFullCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const columns: Array<ColumnDef<Farm>> = [
  {
    accessorKey: 'name',
    header: 'Farm Name',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <img
          src={row.original.image}
          alt={row.original.name}
          className="w-11 h-11 rounded-lg object-cover border border-border"
        />
        <span className="font-medium text-foreground">{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: 'roi',
    header: 'ROI %',
    cell: ({ getValue }) => (
      <span className="text-base font-semibold">{getValue() as number}%</span>
    ),
  },
  {
    accessorKey: 'investmentGoal',
    header: 'Goal',
    cell: ({ getValue }) => (
      <span className="font-medium">
        {formatFullCurrency(getValue() as number)}
      </span>
    ),
  },
  {
    accessorKey: 'durationMonths',
    header: 'Duration',
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">
        {getValue() as number} Months
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const fundingProgress =
        (row.original.fundedAmount / row.original.investmentGoal) * 100
      const status = fundingProgress >= 100 ? 'active' : 'funding'
      return status === 'active' ? (
        <Badge className="border border-green-500 px-3 py-1 text-green-700 bg-green-100/80 rounded-full font-medium text-xs">
          Active
        </Badge>
      ) : (
        <Badge className="border border-yellow-500 px-3 py-1 text-yellow-800 bg-yellow-100/80 rounded-full font-medium text-xs">
          Funding
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: () => (
      <div className="flex items-center justify-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-primary/10 text-primary"
          aria-label="Edit"
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:bg-destructive/10"
          aria-label="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    ),
  },
]

function AdminDashboardPage() {
  const { data, isLoading, error } = useFarms()

  const farms = data?.farms ?? []

  const totalFarms = farms.length
  const openFarms = farms.filter(
    (f) => f.fundedAmount / f.investmentGoal < 1,
  ).length
  const closedFarms = farms.filter(
    (f) => f.fundedAmount / f.investmentGoal >= 1,
  ).length
  const totalFunding = farms.reduce((acc, f) => acc + f.investmentGoal, 0)
  const avgROI = farms.length
    ? (farms.reduce((acc, f) => acc + f.roi, 0) / farms.length).toFixed(1)
    : '0'
  const activeFarms = farms.filter(
    (f) => f.fundedAmount / f.investmentGoal >= 1,
  ).length

  if (error) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center h-96">
          <p className="text-red-500">
            Failed to load dashboard. Please try again.
          </p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            label="Total Farms"
            value={totalFarms.toString()}
            icon={<FolderOpen className="w-4 h-4 text-primary" />}
          />
          <StatsCard
            label="Funding Opportunities"
            value={openFarms.toString()}
            trend={openFarms > 0 ? `+ ${openFarms}` : undefined}
            trendLabel={openFarms === 1 ? 'open' : 'open'}
            icon={<TrendingUp className="w-4 h-4 text-primary" />}
          />
          <StatsCard
            label="Total Funding Goal"
            value={formatFullCurrency(totalFunding)}
            icon={<Coins className="w-4 h-4 text-primary" />}
          />
          <StatsCard
            label="Active Farms"
            value={activeFarms.toString()}
            trend={activeFarms > 0 ? `+ ${activeFarms}` : undefined}
            trendLabel={activeFarms === 1 ? 'active' : 'active'}
          />
          <StatsCard
            label="Closed Farms"
            value={closedFarms.toString()}
            trend={closedFarms > 0 ? `+ ${closedFarms}` : undefined}
            trendLabel={closedFarms === 1 ? 'closed' : 'closed'}
          />
          <StatsCard
            label="Avg. ROI"
            value={`${avgROI}%`}
            icon={<TrendingUp className="w-4 h-4 text-primary" />}
          />
        </div>

        <div className="flex justify-end">
          <Link to="/admin/farm/new">
            <Button className="flex items-center px-5 h-11 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              <Plus className="w-5 h-5 mr-2" />
              <span>Add New Opportunity</span>
            </Button>
          </Link>
        </div>

        <section className="bg-card rounded-2xl border border-border overflow-hidden">
          <header className="px-6 py-4 border-b border-border">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Opportunities Created
            </h2>
          </header>
          <div className="p-4">
            <DataTable
              columns={columns}
              data={farms}
              loading={isLoading}
              searchPlaceholder="Search farms..."
              pageSize={10}
            />
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
