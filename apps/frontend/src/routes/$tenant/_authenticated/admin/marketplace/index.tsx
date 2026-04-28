import { useState } from 'react'
import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import type { Commodity } from '@/types'

import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTenant } from '@/contexts/tenant'
import { useCommodities, useDeleteCommodity } from '@/hooks'
import { formatCurrency } from '@/lib/format-currency'

export const Route = createFileRoute(
  '/$tenant/_authenticated/admin/marketplace/',
)({
  component: AdminMarketplacePage,
})

function AdminMarketplacePage() {
  const { tenant } = Route.useParams()
  const { tenant: tenantConfig } = useTenant()
  const { data, isLoading, error } = useCommodities()
  const deleteCommodity = useDeleteCommodity()
  const router = useRouter()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [commodityToDelete, setCommodityToDelete] = useState<{
    id: string
    name: string
  } | null>(null)

  const columns: Array<ColumnDef<Commodity>> = [
    {
      accessorKey: 'name',
      header: 'Listing',
      cell: ({ row }) => {
        const commodity = row.original

        return (
          <div className="flex items-center gap-3">
            {commodity.images[0] ? (
              <img
                src={commodity.images[0]}
                alt={commodity.name}
                className="h-11 w-11 rounded-lg object-cover border border-border"
              />
            ) : (
              <div className="h-11 w-11 flex-shrink-0 rounded-lg border border-border bg-muted" />
            )}
            <div>
              <p className="font-medium text-foreground">{commodity.name}</p>
              <p className="text-sm text-muted-foreground">
                {commodity.category}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) =>
        formatCurrency(row.original.price, row.original.currency),
    },
    {
      accessorKey: 'availableQuantity',
      header: 'Stock',
      cell: ({ row }) => (
        <span>
          {row.original.availableQuantity} {row.original.unit}
        </span>
      ),
    },
    {
      accessorKey: 'soldQuantity',
      header: 'Sold',
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const commodity = row.original

        return commodity.isPublished ? (
          <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-800">
            Live
          </Badge>
        ) : (
          <Badge className="border border-amber-200 bg-amber-50 text-amber-800">
            Draft
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const commodity = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  router.navigate({
                    to: '/$tenant/admin/marketplace/$id/edit',
                    params: { tenant, id: commodity._id },
                  })
                }
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  setCommodityToDelete({
                    id: commodity._id,
                    name: commodity.name,
                  })
                  setDeleteDialogOpen(true)
                }}
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

  const handleDelete = async () => {
    if (!commodityToDelete) return

    try {
      await deleteCommodity.mutateAsync(commodityToDelete.id)
      toast.success(`Removed ${commodityToDelete.name} from the marketplace`)
      setDeleteDialogOpen(false)
      setCommodityToDelete(null)
    } catch (deleteError) {
      console.error('Failed to delete commodity', deleteError)
      toast.error('Failed to delete marketplace listing')
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-destructive">Failed to load marketplace listings.</p>
      </div>
    )
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 pb-10 space-y-8">
      <header className="pt-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            {tenantConfig.displayName} admin · Marketplace
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Manage marketplace listings
          </h1>
          <p className="text-muted-foreground">
            Publish commodity inventory, update stock, and keep buyer-facing
            pricing current.
          </p>
        </div>

        <div className="flex gap-3">
          <Link to="/$tenant/admin/marketplace/orders" params={{ tenant }}>
            <Button variant="outline">View orders</Button>
          </Link>
          <Link to="/$tenant/admin/marketplace/new" params={{ tenant }}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New listing
            </Button>
          </Link>
        </div>
      </header>

      <DataTable
        columns={columns}
        data={data?.commodities ?? []}
        loading={isLoading}
        searchPlaceholder="Search listings..."
        pageSize={10}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete listing?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes{' '}
              <span className="font-semibold">{commodityToDelete?.name}</span>{' '}
              from the tenant marketplace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete listing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
