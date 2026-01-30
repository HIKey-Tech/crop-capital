import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  TrendingUp,
} from 'lucide-react'
import { Link, createFileRoute } from '@tanstack/react-router'

import type { Farm } from '@/types'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useInvestment } from '@/hooks'
import { formatCurrency } from '@/lib/format-currency'
import { formatDate } from '@/lib/format-date'

export const Route = createFileRoute('/investments/$id')({
  component: InvestmentDetailsPage,
})

function InvestmentDetailsPage() {
  const { id } = Route.useParams()
  const { data, isLoading, error } = useInvestment(id)

  if (isLoading) {
    return (
      <DashboardLayout userRole="investor">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !data?.investment) {
    return (
      <DashboardLayout userRole="investor">
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <p className="text-muted-foreground">Investment not found</p>
          <Button asChild>
            <Link to="/investments">Back to Investments</Link>
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const investment = data.investment
  const farm = investment.farm as Farm

  // Calculate derived values
  const startDate = new Date(investment.createdAt)
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + investment.durationMonths)

  const now = new Date()
  const totalDuration = endDate.getTime() - startDate.getTime()
  const elapsed = now.getTime() - startDate.getTime()
  const progress = Math.min(
    100,
    Math.max(0, Math.round((elapsed / totalDuration) * 100)),
  )
  const daysRemaining = Math.max(
    0,
    Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  )

  const expectedReturn =
    investment.projectedReturn || investment.amount * (1 + investment.roi / 100)

  const getStatusBadge = () => {
    if (investment.roiPaid) {
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          Completed
        </Badge>
      )
    }
    if (investment.status === 'completed') {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          Active
        </Badge>
      )
    }
    return (
      <Badge
        variant="outline"
        className="bg-yellow-50 text-yellow-700 border-yellow-200"
      >
        Pending
      </Badge>
    )
  }

  return (
    <DashboardLayout userRole="investor">
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
          <div className="flex gap-4 items-center">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/investments">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">
                  Investment #{investment._id.slice(-6)}
                </h1>
                {getStatusBadge()}
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                Invested in{' '}
                <span className="font-semibold text-foreground">
                  {farm.name}
                </span>
              </p>
            </div>
          </div>
          <Button variant="outline" className="w-full sm:w-auto" asChild>
            <Link to="/farm/$id" params={{ id: farm._id }}>
              View Farm Details
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-semibold mb-2">
              <DollarSign className="h-4 w-4" /> Invested Amount
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(investment.amount)}
            </div>
          </div>
          <div className="bg-card border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-semibold mb-2">
              <TrendingUp className="h-4 w-4" /> Expected Return
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(expectedReturn)}{' '}
              <span className="text-sm font-medium text-muted-foreground">
                ({investment.roi}%)
              </span>
            </div>
          </div>
          <div className="bg-card border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-semibold mb-2">
              <Clock className="h-4 w-4" /> Maturity Date
            </div>
            <div className="text-xl font-bold">
              {formatDate(endDate.toISOString())}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {daysRemaining > 0
                ? `${daysRemaining} days remaining`
                : 'Matured'}
            </div>
          </div>
          <div className="bg-card border rounded-xl p-5 shadow-sm flex flex-col justify-center">
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="timeline">
              <TabsList className="mb-4">
                <TabsTrigger value="timeline">Activity Timeline</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="details">Investment Details</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="space-y-6">
                <div className="bg-card rounded-xl border p-6">
                  <h3 className="font-semibold mb-4">Investment Milestones</h3>
                  <div className="relative border-l border-gray-200 ml-3 space-y-8 pl-8 py-2">
                    <div className="relative">
                      <div className="absolute -left-9.75 h-5 w-5 rounded-full border-2 border-white bg-green-500 ring-4 ring-green-50" />
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                        <div>
                          <h4 className="font-medium text-foreground">
                            Investment Created
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            You initiated an investment of{' '}
                            {formatCurrency(investment.amount)} in {farm.name}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {formatDate(investment.createdAt)}
                        </span>
                      </div>
                    </div>

                    {investment.status === 'completed' && (
                      <div className="relative">
                        <div className="absolute -left-9.75 h-5 w-5 rounded-full border-2 border-white bg-green-500 ring-4 ring-green-50" />
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                          <div>
                            <h4 className="font-medium text-foreground">
                              Payment Confirmed
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Your payment was successfully processed via
                              Paystack
                            </p>
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {formatDate(investment.updatedAt)}
                          </span>
                        </div>
                      </div>
                    )}

                    {investment.roiPaid && (
                      <div className="relative">
                        <div className="absolute -left-9.75 h-5 w-5 rounded-full border-2 border-white bg-blue-500 ring-4 ring-blue-50" />
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                          <div>
                            <h4 className="font-medium text-foreground">
                              ROI Paid
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Your returns have been credited to your account
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {!investment.roiPaid &&
                      investment.status === 'completed' && (
                        <div className="relative">
                          <div className="absolute -left-9.75 h-5 w-5 rounded-full border-2 border-white bg-gray-300 ring-4 ring-gray-50" />
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                            <div>
                              <h4 className="font-medium text-muted-foreground">
                                Awaiting Maturity
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                Your investment is growing. Expected payout on{' '}
                                {formatDate(endDate.toISOString())}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents">
                <div className="grid gap-4">
                  <div className="bg-card border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          Investment Agreement.pdf
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Signed on {formatDate(investment.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Download
                    </Button>
                  </div>
                  <div className="bg-card border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          Official Receipt.pdf
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Transaction ID: #{investment._id.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Download
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details">
                <div className="bg-card rounded-xl border p-6 space-y-4">
                  <h3 className="font-semibold">Investment Summary</h3>
                  <div className="grid gap-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">
                        Investment ID
                      </span>
                      <span className="font-mono text-sm">
                        {investment._id}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Farm</span>
                      <span className="font-medium">{farm.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">
                        Amount Invested
                      </span>
                      <span className="font-medium">
                        {formatCurrency(investment.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">ROI Rate</span>
                      <span className="font-medium">{investment.roi}%</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">
                        {investment.durationMonths} months
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">
                        Expected Return
                      </span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(expectedReturn)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Status</span>
                      {getStatusBadge()}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Side Panel: Farm Info */}
          <div className="space-y-6">
            <div className="bg-card border rounded-xl overflow-hidden">
              <img
                src={farm.image}
                alt={farm.name}
                className="h-48 w-full object-cover"
              />
              <div className="p-5">
                <Link
                  to="/farm/$id"
                  params={{ id: farm._id }}
                  className="hover:underline"
                >
                  <h3 className="font-bold text-lg mb-1">{farm.name}</h3>
                </Link>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />{' '}
                  Verified Project
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {farm.location}
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Have questions?</span>
                    <Button
                      variant="link"
                      className="px-0 h-auto text-green-600"
                    >
                      Contact Support
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
