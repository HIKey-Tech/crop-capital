import { Link, createFileRoute } from '@tanstack/react-router'
import { Edit, Plus, Trash } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

import type { Farm } from '@/types'

import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useFarms } from '@/hooks'
import { formatCurrency } from '@/lib/format-currency'

export const Route = createFileRoute('/_authenticated/admin/farms')({
  component: AdminFarmPage,
})

const columns: Array<ColumnDef<Farm>> = [
  {
    accessorKey: 'name',
    header: 'Farm Name',
    cell: ({ row }) => {
      const farm = row.original
      return (
        <div className="flex items-center gap-3">
          <img
            src={farm.image}
            alt={farm.name}
            className="w-11 h-11 rounded-lg object-cover border border-border"
          />
          <span className="font-medium text-foreground">{farm.name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'roi',
    header: 'ROI %',
    cell: ({ getValue }) => {
      const roi = getValue() as number
      return <span className="text-base font-semibold">{roi}%</span>
    },
  },
  {
    accessorKey: 'investmentGoal',
    header: 'Goal',
    cell: ({ getValue }) => {
      const goal = getValue() as number
      return <span className="font-medium">{formatCurrency(goal)}</span>
    },
  },
  {
    accessorKey: 'durationMonths',
    header: 'Duration',
    cell: ({ getValue }) => {
      const months = getValue() as number
      return <span className="text-muted-foreground">{months} Months</span>
    },
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const farm = row.original
      const fundingProgress = (farm.fundedAmount / farm.investmentGoal) * 100
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
    cell: () => {
      return (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="outline"
            className="px-2 py-1 h-9 text-sm border-border"
            aria-label="Edit Farm"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="px-2 py-1 h-9 text-sm border-border"
            aria-label="Delete Farm"
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      )
    },
  },
]

function AdminFarmPage() {
  const { data, isLoading, error } = useFarms()

  const farms = data?.farms ?? []

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500">Failed to load farms. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 mb-10 space-y-8">
      {/* Hierarchy */}
      <header className="pt-6 pb-2 flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Admin » Farms</span>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Manage Farms
        </h1>
        <p className="text-base text-muted-foreground max-w-xl">
          View, edit, and manage all farm opportunities on the platform.
        </p>
      </header>

      {/* Top bar: Add New Button */}
      <div className="flex justify-end">
        <Link to="/admin/farm/new">
          <Button
            className="flex items-center px-5 h-11 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            style={{ minWidth: 200, fontSize: '1rem' }}
          >
            <Plus className="w-5 h-5 mr-2" />
            <span>Add New Opportunity</span>
          </Button>
        </Link>
      </div>

      {/* Farms Table */}
      <DataTable
        columns={columns}
        data={farms}
        loading={isLoading}
        searchPlaceholder="Search farms..."
        pageSize={10}
      />
    </div>
  )
}
