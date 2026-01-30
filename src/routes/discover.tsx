import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Filter, Search, Sprout, X } from 'lucide-react'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { useFarms } from '@/hooks'
import { FarmCard } from '@/components/dashboard/farm-card'
import { LoadingSpinner } from '@/components/ui/loading'

export const Route = createFileRoute('/discover')({
  component: DiscoverPage,
})

function DiscoverPage() {
  const { data, isLoading, error } = useFarms()
  const [search, setSearch] = useState('')
  const [roiFilter, setRoiFilter] = useState<'all' | 'high' | 'medium'>('all')
  const [durationFilter, setDurationFilter] = useState<'all' | 'short' | 'long'>('all')

  const farms = data?.farms ?? []

  const filteredFarms = farms.filter(farm => {
    const matchesSearch = farm.name.toLowerCase().includes(search.toLowerCase()) ||
      farm.location.toLowerCase().includes(search.toLowerCase())

    const matchesRoi = roiFilter === 'all'
      ? true
      : roiFilter === 'high' ? farm.roi >= 20 : farm.roi < 20

    const matchesDuration = durationFilter === 'all'
      ? true
      : durationFilter === 'short' ? farm.durationMonths <= 6 : farm.durationMonths > 6

    return matchesSearch && matchesRoi && matchesDuration
  })

  // Mock data if API is empty/loading
  const displayFarms = filteredFarms.length > 0 ? filteredFarms : (isLoading ? [] : [])

  if (isLoading) {
    return (
      <DashboardLayout userRole="investor">
        <LoadingSpinner />
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout userRole="investor">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">We couldn't load the farms. Please try again.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="investor">
      <div className="flex flex-col md:flex-row gap-8 animate-fade-in max-w-screen-2xl mx-auto px-4">

        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 shrink-0 space-y-8">
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filters
            </h3>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">ROI Range</label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="roi" checked={roiFilter === 'all'} onChange={() => setRoiFilter('all')} />
                    All Ranges
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="roi" checked={roiFilter === 'high'} onChange={() => setRoiFilter('high')} />
                    High Yield (20%+)
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="roi" checked={roiFilter === 'medium'} onChange={() => setRoiFilter('medium')} />
                    Standard (5-19%)
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">Duration</label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="duration" checked={durationFilter === 'all'} onChange={() => setDurationFilter('all')} />
                    Any Duration
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="duration" checked={durationFilter === 'short'} onChange={() => setDurationFilter('short')} />
                    Short Term (&lt; 6 mos)
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="duration" checked={durationFilter === 'long'} onChange={() => setDurationFilter('long')} />
                    Long Term (6+ mos)
                  </label>
                </div>
              </div>

              {(roiFilter !== 'all' || durationFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => { setRoiFilter('all'); setDurationFilter('all'); }}
                >
                  <X className="h-3 w-3 mr-2" /> Clear Filters
                </Button>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search farms, locations..."
                className="pl-9 h-11"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              Showing {displayFarms.length} opportunities
            </div>
          </div>

          {displayFarms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayFarms.map((farm) => (
                <FarmCard key={farm._id} farm={farm} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No farms found"
              description="Try adjusting your filters or search terms."
              icon={Sprout}
              action={<Button variant="outline" onClick={() => { setSearch(''); setRoiFilter('all'); setDurationFilter('all'); }}>Reset All</Button>}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}