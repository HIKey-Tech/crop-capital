import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Filter, Search, Sprout, X } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useFarms } from '@/hooks'
import { FarmCard } from '@/components/dashboard/farm-card'
import { LoadingSpinner } from '@/components/ui/loading'

export const Route = createFileRoute('/$tenant/_authenticated/farms/')({
  component: FarmsPage,
})

function FarmsPage() {
  const { data, isLoading, error } = useFarms()
  const [search, setSearch] = useState('')
  const [roiFilter, setRoiFilter] = useState<'all' | 'high' | 'medium'>('all')
  const [durationFilter, setDurationFilter] = useState<
    'all' | 'short' | 'long'
  >('all')

  const farms = data?.farms ?? []

  const filteredFarms = farms.filter((farm) => {
    const matchesSearch =
      farm.name.toLowerCase().includes(search.toLowerCase()) ||
      farm.location.toLowerCase().includes(search.toLowerCase())

    const matchesRoi =
      roiFilter === 'all'
        ? true
        : roiFilter === 'high'
          ? farm.roi >= 20
          : farm.roi < 20

    const matchesDuration =
      durationFilter === 'all'
        ? true
        : durationFilter === 'short'
          ? farm.durationMonths <= 6
          : farm.durationMonths > 6

    return matchesSearch && matchesRoi && matchesDuration
  })

  // Mock data if API is empty/loading
  const displayFarms =
    filteredFarms.length > 0 ? filteredFarms : isLoading ? [] : []

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-4">
          We couldn't load the farms. Please try again.
        </p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 animate-fade-in mx-auto px-4">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-80 shrink-0">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-border/50 sticky top-4">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b">
            <Filter className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-xl text-foreground">Filters</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-semibold text-foreground block">
                ROI Range
              </label>
              <RadioGroup
                value={roiFilter}
                onValueChange={(value) =>
                  setRoiFilter(value as 'all' | 'high' | 'medium')
                }
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 group">
                  <RadioGroupItem
                    value="all"
                    id="roi-all"
                    className="border-2"
                  />
                  <Label
                    htmlFor="roi-all"
                    className="cursor-pointer font-medium text-[15px] group-hover:text-primary transition-colors"
                  >
                    All Ranges
                  </Label>
                </div>
                <div className="flex items-center space-x-3 group">
                  <RadioGroupItem
                    value="high"
                    id="roi-high"
                    className="border-2"
                  />
                  <Label
                    htmlFor="roi-high"
                    className="cursor-pointer font-medium text-[15px] group-hover:text-primary transition-colors"
                  >
                    High Yield (20%+)
                  </Label>
                </div>
                <div className="flex items-center space-x-3 group">
                  <RadioGroupItem
                    value="medium"
                    id="roi-medium"
                    className="border-2"
                  />
                  <Label
                    htmlFor="roi-medium"
                    className="cursor-pointer font-medium text-[15px] group-hover:text-primary transition-colors"
                  >
                    Standard (5-19%)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="h-px bg-border/50" />

            <div className="space-y-4">
              <label className="text-sm font-semibold text-foreground block">
                Duration
              </label>
              <RadioGroup
                value={durationFilter}
                onValueChange={(value) =>
                  setDurationFilter(value as 'all' | 'short' | 'long')
                }
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 group">
                  <RadioGroupItem
                    value="all"
                    id="duration-all"
                    className="border-2"
                  />
                  <Label
                    htmlFor="duration-all"
                    className="cursor-pointer font-medium text-[15px] group-hover:text-primary transition-colors"
                  >
                    Any Duration
                  </Label>
                </div>
                <div className="flex items-center space-x-3 group">
                  <RadioGroupItem
                    value="short"
                    id="duration-short"
                    className="border-2"
                  />
                  <Label
                    htmlFor="duration-short"
                    className="cursor-pointer font-medium text-[15px] group-hover:text-primary transition-colors"
                  >
                    Short Term (&lt; 6 mos)
                  </Label>
                </div>
                <div className="flex items-center space-x-3 group">
                  <RadioGroupItem
                    value="long"
                    id="duration-long"
                    className="border-2"
                  />
                  <Label
                    htmlFor="duration-long"
                    className="cursor-pointer font-medium text-[15px] group-hover:text-primary transition-colors"
                  >
                    Long Term (6+ mos)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {(roiFilter !== 'all' || durationFilter !== 'all') && (
              <>
                <div className="h-px bg-border/50" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 font-medium h-10"
                  onClick={() => {
                    setRoiFilter('all')
                    setDurationFilter('all')
                  }}
                >
                  <X className="h-4 w-4 mr-2" /> Clear Filters
                </Button>
              </>
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

        <section className="@container w-full">
          {displayFarms.length > 0 ? (
            <div className="grid grid-cols-1 @xl:grid-cols-2 @4xl:grid-cols-3 gap-6">
              {displayFarms.map((farm) => (
                <FarmCard key={farm._id} farm={farm} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No farms found"
              description="Try adjusting your filters or search terms."
              icon={Sprout}
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch('')
                    setRoiFilter('all')
                    setDurationFilter('all')
                  }}
                >
                  Reset All
                </Button>
              }
            />
          )}
        </section>
      </div>
    </div>
  )
}
