import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight, Sprout } from 'lucide-react'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { InvestmentCard } from '@/components/dashboard/investment-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/ui/loading'
import { useMyInvestments } from '@/hooks'

export const Route = createFileRoute('/investments/')({
  component: MyInvestmentsPage,
})

function MyInvestmentsPage() {
  const [activeTab, setActiveTab] = useState('active')
  const { data, isLoading, error } = useMyInvestments()

  const investments = data?.investments ?? []
  const activeInvestments = investments.filter(
    (i) => i.status === 'pending' || i.status === 'completed',
  )
  const completedInvestments = investments.filter((i) => i.roiPaid)

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
        <div className="flex items-center justify-center h-96">
          <EmptyState
            title="Failed to load investments"
            description="We couldn't fetch your investment portfolio. Please try again later."
            className="bg-red-50 border-red-100"
          />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="investor">
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Investments</h1>
            <p className="text-muted-foreground">
              Track the progress of your active and completed farm investments.
            </p>
          </div>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link to="/discover">
              Browse Farms
            </Link>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {activeInvestments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeInvestments.map((investment, index) => (
                  <div
                    key={investment._id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <InvestmentCard investment={investment} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Sprout}
                title="No active investments"
                description="You don't have any active farm investments at the moment. Start growing your portfolio today!"
                action={
                  <Button asChild className="btn-primary-gradient">
                    <Link to="/discover">
                      Explore Farms
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                }
              />
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {completedInvestments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedInvestments.map((investment, index) => (
                  <div
                    key={investment._id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <InvestmentCard investment={investment} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No completed investments"
                description="Investments that have matured and paid out will appear here."
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
