import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  ArrowRight,
  Clock,
  DollarSign,
  MapPin,
  Plus,
  Shield,
  Target,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useFarm, useInvest } from '@/hooks'
import { formatCurrency } from '@/lib/format-currency'

function calculateFundingProgress(current: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(100, Math.round((current / target) * 100))
}

export const Route = createFileRoute('/farm/$id')({
  component: FarmDetailsPage,
})

function FarmDetailsPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const [investmentAmount, setInvestmentAmount] = useState('1000')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [showInvestment, setShowInvestment] = useState(false)

  const { data, isLoading, error } = useFarm(id)
  const investMutation = useInvest()

  if (isLoading) {
    return (
      <DashboardLayout userRole="investor">
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading farm details...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !data?.farm) {
    return (
      <DashboardLayout userRole="investor">
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Farm not found</p>
        </div>
      </DashboardLayout>
    )
  }

  const farm = data.farm
  const progress = calculateFundingProgress(
    farm.fundedAmount,
    farm.investmentGoal,
  )
  const amount = parseFloat(investmentAmount) || 0

  const expectedPayoutDate = new Date()
  expectedPayoutDate.setMonth(
    expectedPayoutDate.getMonth() + farm.durationMonths,
  )

  const handleInvest = async () => {
    if (amount < farm.minimumInvestment) {
      toast.error(
        `Minimum investment is ${formatCurrency(farm.minimumInvestment)}`,
      )
      return
    }

    try {
      const result = await investMutation.mutateAsync({
        farmId: farm._id,
        amount,
      })

      if (result.authorizationUrl) {
        // Redirect to Paystack payment page
        window.location.href = result.authorizationUrl
      } else {
        toast.success('Investment Successful!', {
          description: `Your investment in '${farm.name}' is confirmed.`,
        })

        setTimeout(() => {
          navigate({ to: "/investments" })
        }, 1500)
      }
    } catch (err) {
      toast.error('Investment failed. Please try again.')
    }
  }

  if (showInvestment) {
    return (
      <DashboardLayout userRole="investor">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {farm.name}
          </h1>
          <p className="text-muted-foreground mb-8">
            Enter your investment details below to proceed.
          </p>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1" />
            <div className="w-full lg:w-96">
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="mb-6">
                  <Label htmlFor="amount">Enter Amount (USD)</Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      className="pl-7 text-lg"
                      min={farm.minimumInvestment}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-primary mb-1">Projected ROI</p>
                    <p className="text-xl font-bold">{farm.roi}% APY</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-primary mb-1">Expected Payout</p>
                    <p className="text-xl font-bold">
                      {expectedPayoutDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <Label className="mb-3 block">Payment Method</Label>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <div
                      className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-primary bg-secondary' : 'border-border'}`}
                    >
                      <Label
                        htmlFor="card"
                        className="flex flex-col cursor-pointer"
                      >
                        <span className="font-medium">Pay with Card</span>
                        <span className="text-sm text-muted-foreground">
                          Paystack
                        </span>
                      </Label>
                      <RadioGroupItem value="card" id="card" />
                    </div>
                    <div
                      className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors mt-2 ${paymentMethod === 'wallet' ? 'border-primary bg-secondary' : 'border-border'}`}
                    >
                      <Label
                        htmlFor="wallet"
                        className="flex flex-col cursor-pointer"
                      >
                        <span className="font-medium">Pay with Wallet</span>
                        <span className="text-sm text-muted-foreground">
                          Use your AYF balance
                        </span>
                      </Label>
                      <RadioGroupItem value="wallet" id="wallet" />
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  className="w-full h-12 bg-primary text-primary-foreground font-semibold rounded-lg"
                  onClick={handleInvest}
                >
                  Proceed to Payment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-primary">
                  <Shield className="w-4 h-4" />
                  <span>Secure SSL Encryption Payment</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <a
              href="#"
              className="text-primary text-sm hover:underline flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Need help? Read our investment FAQs or Contact Support
            </a>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  function InvestmentDetail({
    icon: Icon,
    label,
    value,
  }: {
    icon: React.ElementType
    label: string
    value: string
  }) {
    return (
      <div className="flex flex-col items-center gap-0.5 min-w-23.75">
        <div className="rounded-full bg-muted flex items-center justify-center h-9 w-9 mb-1 border border-border">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-semibold text-base text-foreground">{value}</div>
      </div>
    )
  }

  return (
    <DashboardLayout userRole="investor">
      <div className="max-w-6xl mx-auto animate-fade-in">
        {/* Hero Image */}
        <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-8 border border-border">
          <img
            src={farm.image}
            alt={farm.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute bottom-6 left-6 flex flex-col gap-1">
            <Badge
              variant="secondary"
              className="mb-1 w-fit px-3 py-1.5 text-xs tracking-wide"
            >
              Verified Project
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground drop-shadow-none">
              {farm.name}
            </h1>
            <p className="text-primary-foreground/80 font-medium text-base">
              Cultivating Prosperity in Rural Liberia
            </p>
          </div>
        </div>

        {/* Tabs and Sidebar layout */}
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main Content */}
          <div className="flex-1">
            <Tabs defaultValue="overview">
              <TabsList className="mb-1 border-b border-border bg-transparent px-0 py-0 gap-2">
                <TabsTrigger
                  value="overview"
                  className="text-md px-3 py-1 font-medium border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="updates"
                  className="text-md px-3 py-1 font-medium border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary"
                >
                  Updates (2)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-7">
                <div className="max-w-none">
                  <h2 className="text-lg font-semibold mb-2 tracking-wide text-foreground">
                    About the Project
                  </h2>
                  <p className="text-muted-foreground mb-3 leading-relaxed">
                    {farm.location}
                  </p>
                </div>

                {/* Investment Details Section */}
                <div className="mt-8 mb-8">
                  <h3 className="text-md font-semibold mb-2 uppercase tracking-wider text-primary/80">
                    Investment Details
                  </h3>
                  <div className="flex flex-wrap gap-5 border border-border bg-card rounded-xl px-6 py-4">
                    <InvestmentDetail
                      icon={DollarSign}
                      label="Min. Invest"
                      value={formatCurrency(farm.minimumInvestment)}
                    />
                    <InvestmentDetail
                      icon={TrendingUp}
                      label="ROI"
                      value={farm.roi + '%'}
                    />
                    <InvestmentDetail
                      icon={Clock}
                      label="Duration"
                      value={farm.durationMonths + ' Months'}
                    />
                  </div>
                </div>

                {/* Planting Location Map Section */}
                <div className="mb-10">
                  <h3 className="text-md font-semibold mb-2 uppercase tracking-wider text-primary/80">
                    Planting Location
                  </h3>
                  <div className="rounded-xl border border-border overflow-hidden max-w-full">
                    <iframe
                      title={`Map for ${farm.location}`}
                      width="100%"
                      height="320"
                      style={{ border: 0 }}
                      loading="lazy"
                      className="w-full h-80 grayscale-[0.09]"
                      src={`https://www.openstreetmap.org/export/embed.html?search=${encodeURIComponent(
                        farm.location,
                      )}&layer=mapnik`}
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="updates" className="mt-7">
                <div className="space-y-4">
                  <div className="bg-card border border-border rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Dec 10, 2024
                    </p>
                    <h4 className="font-semibold mb-1 text-foreground">
                      Planting Phase Complete
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Successfully completed the initial planting phase. Crops
                      are showing excellent early growth.
                    </p>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Nov 25, 2024
                    </p>
                    <h4 className="font-semibold mb-1 text-foreground">
                      Land Preparation Finished
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Completed soil preparation and irrigation system
                      installation.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 shrink-0 mt-10 lg:mt-0">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-6 flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-primary mb-0.5 flex items-center gap-1 uppercase tracking-wider">
                    <MapPin className="w-3 h-3" /> Location
                  </p>
                  <p className="font-medium text-foreground">{farm.location}</p>
                </div>
                <div>
                  <p className="text-xs text-primary mb-0.5 flex items-center gap-1 uppercase tracking-wider">
                    <Clock className="w-3 h-3" /> Duration
                  </p>
                  <p className="font-medium text-foreground">
                    {farm.durationMonths} Months
                  </p>
                </div>
                <div>
                  <p className="text-xs text-primary mb-0.5 flex items-center gap-1 uppercase tracking-wider">
                    <TrendingUp className="w-3 h-3" /> Projected ROI
                  </p>
                  <p className="font-medium text-foreground">{farm.roi}% APY</p>
                </div>
                <div>
                  <p className="text-xs text-primary mb-0.5 flex items-center gap-1 uppercase tracking-wider">
                    <Target className="w-3 h-3" /> Funding Goal
                  </p>
                  <p className="font-medium text-foreground">
                    {formatCurrency(farm.investmentGoal)}
                  </p>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex items-center justify-between text-xs mb-1.5 uppercase tracking-wider">
                  <span className="text-primary font-semibold">
                    Funding Progress
                  </span>
                  <span className="font-medium text-foreground">
                    {progress}%
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-[#F0F0F0] overflow-hidden relative w-full border border-border">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: '#FFC72C',
                    }}
                  ></div>
                  {progress > 5 && (
                    <div
                      className="absolute -top-1 h-4 w-4 rounded-full border-2 border-white bg-[#FFC72C] transition-all duration-500"
                      style={{
                        left: `calc(${progress}% - 8px)`,
                        zIndex: 2,
                      }}
                    ></div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {formatCurrency(farm.fundedAmount)} of{' '}
                  {formatCurrency(farm.investmentGoal)}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 font-medium rounded-lg border border-primary text-primary hover:bg-secondary"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add to Watchlist
                </Button>
                <Button
                  className="flex-1 bg-primary text-primary-foreground font-semibold rounded-lg"
                  onClick={() => setShowInvestment(true)}
                >
                  Invest Now
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
