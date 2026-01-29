import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { InvestmentCard } from '@/components/dashboard/investment-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { useMyInvestments } from '@/hooks'

export const Route = createFileRoute('/my-investments')({
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
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading investments...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout userRole="investor">
        <div className="flex items-center justify-center h-96">
          <p className="text-red-500">
            Failed to load investments. Please try again.
          </p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="investor">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Investments</h1>
          <p className="text-muted-foreground">
            Track the progress of your active completed farm investments.
          </p>
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
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <p className="text-muted-foreground mb-4">
                  You don&apos;t have any active investments yet.
                </p>
                <Link to="/discover">
                  <Button className="btn-primary-gradient">
                    Explore Farms
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
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
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <p className="text-muted-foreground">
                  No completed investments yet.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-center mt-8">
          <Link to="/discover">
            <Button className="btn-primary-gradient">
              Explore More Farms
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
