import { Link, createFileRoute } from '@tanstack/react-router'

import { Sprout } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { useFarms } from '@/hooks'
import { formatDate } from '@/lib/format-date'

export const Route = createFileRoute('/_authenticated/news')({
  component: NewsPage,
})

function NewsPage() {
  const { data, isLoading, error } = useFarms()

  // Extract all farm updates and flatten them
  const updates = (data?.farms || [])
    .flatMap((farm) =>
      farm.updates.map((update) => ({
        id: `${farm._id}-${update.date}`,
        farmId: farm._id,
        farmName: farm.name,
        farmImage: farm.images[0],
        stage: update.stage,
        image: update.image || farm.images[0],
        date: update.date,
      })),
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-muted-foreground">Failed to load farm updates</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">News & Updates</h1>
        <p className="text-muted-foreground">
          Stay informed about farm progress and platform updates.
        </p>
      </div>

      {updates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {updates.map((update, index) => (
            <Link
              key={update.id}
              to="/farms/$id"
              params={{ id: update.farmId }}
              className="block"
            >
              <article
                className="card-elevated rounded-xl overflow-hidden border border-border animate-slide-up hover:shadow-md transition-shadow cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img
                  src={update.image}
                  alt={update.farmName}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    {formatDate(update.date)}
                  </p>
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                    {update.farmName}: {update.stage}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Farm update for {update.farmName}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Sprout}
          title="No updates yet"
          description="Farm updates will appear here as they become available"
        />
      )}
    </div>
  )
}
