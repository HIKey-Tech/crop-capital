import { useState } from 'react'
import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { ColumnDef } from '@tanstack/react-table'

import type { Farm } from '@/types'

import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useTenant } from '@/contexts/tenant'
import { useDeleteFarm, useFarms } from '@/hooks'
import { formatCurrency } from '@/lib/format-currency'

export const Route = createFileRoute('/$tenant/_authenticated/admin/farms/')({
  component: AdminFarmPage,
})

function AdminFarmPage() {
  const { tenant } = Route.useParams()
  const { tenant: tenantConfig } = useTenant()
  const { data, isLoading, error } = useFarms()

  const deleteFarm = useDeleteFarm()
  const router = useRouter()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [farmToDelete, setFarmToDelete] = useState<{
    id: string
    name: string
  } | null>(null)

  const handleDeleteClick = (farmId: string, farmName: string) => {
    setFarmToDelete({ id: farmId, name: farmName })
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!farmToDelete) return

    try {
      await deleteFarm.mutateAsync(farmToDelete.id)
      toast.success(`"${farmToDelete.name}" has been deleted`)
      setDeleteDialogOpen(false)
      setFarmToDelete(null)
    } catch (err) {
      console.error('Failed to delete farm:', err)
      toast.error('Failed to delete farm. Please try again.')
    }
  }

  const columns: Array<ColumnDef<Farm>> = [
    {
      accessorKey: 'name',
      header: 'Farm Name',
      cell: ({ row }) => {
        const farm = row.original
        return (
          <div className="flex items-center gap-3">
            <img
              src={farm.images[0]}
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
      cell: ({ getValue, row }) => {
        const goal = getValue() as number
        return (
          <span className="font-medium">
            {formatCurrency(goal, row.original.currency)}
          </span>
        )
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
      header: '',
      cell: ({ row }) => {
        const farm = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  router.navigate({
                    to: '/$tenant/admin/farms/$id/edit',
                    params: { tenant, id: farm._id },
                  })
                }
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => handleDeleteClick(farm._id, farm.name)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

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
        <span className="text-xs text-muted-foreground">
          {tenantConfig.displayName} admin · Farms
        </span>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Manage farms for {tenantConfig.displayName}
        </h1>
        <p className="text-base text-muted-foreground max-w-xl">
          Create, review, and maintain the opportunities investors see inside{' '}
          {tenantConfig.displayName}.
        </p>
      </header>

      <div className="flex justify-end">
        <Link to="/$tenant/admin/farms/new" params={{ tenant }}>
          <Button className="btn-primary-gradient flex items-center px-5 h-11 rounded-lg font-semibold">
            <Plus className="w-5 h-5 mr-2" />
            <span>Add Farm Opportunity</span>
          </Button>
        </Link>
      </div>

      {/* Farms Table */}
      <DataTable
        columns={columns}
        data={data?.farms ?? []}
        loading={isLoading}
        searchPlaceholder="Search farms..."
        pageSize={10}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{' '}
              <span className="font-semibold">{farmToDelete?.name}</span>. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
