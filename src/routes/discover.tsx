import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Search } from 'lucide-react'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { FarmCard } from '@/components/dashboard/farm-card'
import { Input } from '@/components/ui/input'
import { useFarms } from '@/hooks'

export const Route = createFileRoute('/discover')({
  component: DiscoverPage,
})

function DiscoverPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: farmsResponse, isLoading } = useFarms()

  const allFarms = farmsResponse?.farms || []
  const filteredFarms = allFarms.filter(
    (farm) =>
      farm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farm.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <DashboardLayout userRole="investor">
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Discover Farms
            </h1>
            <p className="text-muted-foreground">
              Find and invest in verified agricultural projects
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search farms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p>Loading farms...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFarms.map((farm, index) => (
                <div
                  key={farm._id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <FarmCard farm={farm} />
                </div>
              ))}
            </div>

            {filteredFarms.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No farms found matching your search.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
