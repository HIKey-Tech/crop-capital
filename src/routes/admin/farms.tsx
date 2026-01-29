import { Link, createFileRoute } from '@tanstack/react-router'
import { Edit, Plus, Trash } from 'lucide-react'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useFarms } from '@/hooks'

export const Route = createFileRoute('/admin/farms')({
  component: AdminFarmPage,
})

function formatFullCurrency(value: number) {
  return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 0 })
}

function AdminFarmPage() {
  const { data, isLoading, error } = useFarms()

  const farms = data?.farms ?? []

  if (isLoading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading farms...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center h-96">
          <p className="text-red-500">
            Failed to load farms. Please try again.
          </p>
        </div>
      </DashboardLayout>
    )
  }
  return (
    <DashboardLayout userRole="admin">
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
        <section className="bg-card rounded-2xl border border-border overflow-x-auto">
          <header className="px-6 py-4 border-b border-border">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Opportunities Created
            </h2>
          </header>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-56">Farm Name</TableHead>
                <TableHead className="w-24 text-center">ROI %</TableHead>
                <TableHead className="w-32 text-center">Goal</TableHead>
                <TableHead className="w-28 text-center">Duration</TableHead>
                <TableHead className="w-36 text-center">Status</TableHead>
                <TableHead className="w-28 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {farms.map((farm) => {
                // Determine status based on funding progress
                const fundingProgress =
                  (farm.fundedAmount / farm.investmentGoal) * 100
                const status = fundingProgress >= 100 ? 'active' : 'funding'

                return (
                  <TableRow
                    key={farm._id}
                    className="transition-colors hover:bg-muted/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={farm.image}
                          alt={farm.name}
                          className="w-11 h-11 rounded-lg object-cover border border-border"
                        />
                        <span className="font-medium text-foreground">
                          {farm.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center align-middle">
                      <span className="text-base font-semibold">
                        {farm.roi}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center align-middle">
                      <span className="font-medium">
                        {formatFullCurrency(farm.investmentGoal)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center align-middle text-muted-foreground">
                      {farm.durationMonths} Months
                    </TableCell>
                    <TableCell className="text-center align-middle">
                      {status === 'active' && (
                        <Badge className="border border-green-500 px-3 py-1 text-green-700 bg-green-100/80 rounded-full font-medium text-xs">
                          Active
                        </Badge>
                      )}
                      {status === 'funding' && (
                        <Badge className="border border-yellow-500 px-3 py-1 text-yellow-800 bg-yellow-100/80 rounded-full font-medium text-xs">
                          Funding
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center align-middle">
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
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </section>
      </div>
    </DashboardLayout>
  )
}
