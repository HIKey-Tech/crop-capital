import { createFileRoute } from '@tanstack/react-router'

import { DashboardLayout } from '@/components/layout/dashboard-layout'

export const Route = createFileRoute('/news')({
  component: NewsPage,
})

// Static news data - could be fetched from API in the future
const updates = [
  {
    id: 1,
    title: 'Green Palm Trees Farm reaches 50% funding milestone',
    date: 'Dec 15, 2024',
    excerpt:
      'Our flagship palm tree project has attracted over 125 investors and is on track to meet its funding goal.',
    image:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    title: 'New Cassava Farm launching in January 2025',
    date: 'Dec 12, 2024',
    excerpt:
      'Exciting new investment opportunity in sustainable cassava production coming soon to the platform.',
    image:
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    title: 'Q3 2024 ROI payouts completed',
    date: 'Dec 1, 2024',
    excerpt:
      'All scheduled ROI payouts for Q3 investments have been successfully processed and distributed to investors.',
    image:
      'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80',
  },
]

function NewsPage() {
  return (
    <DashboardLayout userRole="investor">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">News & Updates</h1>
          <p className="text-muted-foreground">
            Stay informed about farm progress and platform news.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {updates.map((update, index) => (
            <article
              key={update.id}
              className="card-elevated rounded-xl overflow-hidden border border-border animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <img
                src={update.image}
                alt={update.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <p className="text-sm text-muted-foreground mb-2">
                  {update.date}
                </p>
                <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                  {update.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {update.excerpt}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
