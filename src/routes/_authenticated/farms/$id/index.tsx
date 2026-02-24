import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  ArrowRight,
  Check,
  Clock,
  DollarSign,
  MapPin,
  Plus,
  Shield,
  Target,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'

import { z } from 'zod'
import { useForm } from '@mantine/form'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  useAddToWatchlist,
  useFarm,
  useInvest,
  useIsInWatchlist,
  useRemoveFromWatchlist,
} from '@/hooks'
import { formatCurrency } from '@/lib/format-currency'
import { getFarmImages } from '@/lib/farm-utils'
import { ImageGallery } from '@/components/ui/image-gallery'

function calculateFundingProgress(current: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(100, Math.round((current / target) * 100))
}

interface InvestmentDetailProps {
  icon: React.ElementType
  label: string
  value: string
}

function InvestmentDetail({ icon: Icon, label, value }: InvestmentDetailProps) {
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

export const Route = createFileRoute('/_authenticated/farms/$id/')({
  validateSearch: z.object({ invest: z.boolean().optional() }),
  component: FarmDetailsPage,
})

function FarmDetailsPage() {
  const { id } = Route.useParams()
  const { invest = false } = Route.useSearch()

  const { data, isLoading, error } = useFarm(id)
  const isInWatchlist = useIsInWatchlist(id)
  const addToWatchlist = useAddToWatchlist()
  const removeFromWatchlist = useRemoveFromWatchlist()

  const navigate = useNavigate()
  const investMutation = useInvest()

  const form = useForm({
    initialValues: {
      amount: 1000,
      paymentMethod: 'card',
    },
    validate: {
      amount: (value) => {
        if (!data?.farm) return null
        if (value < data.farm.minimumInvestment) {
          return `Minimum investment is ${formatCurrency(data.farm.minimumInvestment)}`
        }
        return null
      },
    },
  })

  const handleWatchlistToggle = async () => {
    try {
      if (isInWatchlist) {
        await removeFromWatchlist.mutateAsync(id)
        toast.success('Removed from watchlist')
      } else {
        await addToWatchlist.mutateAsync(id)
        toast.success('Added to watchlist')
      }
    } catch (error) {
      toast.error('Failed to update watchlist')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading farm details...</p>
      </div>
    )
  }

  if (error || !data?.farm) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Farm not found</p>
      </div>
    )
  }

  const farm = data.farm
  const progress = calculateFundingProgress(
    farm.fundedAmount,
    farm.investmentGoal,
  )

  const expectedPayoutDate = new Date()
  expectedPayoutDate.setMonth(
    expectedPayoutDate.getMonth() + farm.durationMonths,
  )

  const handleInvest = form.onSubmit(async (values) => {
    try {
      const result = await investMutation.mutateAsync({
        farmId: farm._id,
        amount: values.amount,
      })

      if (result.authorizationUrl) {
        // Redirect to Paystack payment page
        window.location.href = result.authorizationUrl
      } else {
        toast.success('Investment Successful!', {
          description: `Your investment in '${farm.name}' is confirmed.`,
        })

        setTimeout(() => {
          navigate({ to: '/investments' })
        }, 1500)
      }
    } catch (err) {
      toast.error('Investment failed. Please try again.')
    }
  })

  if (invest) {
    return (
      <div className="max-w-6xl mx-auto animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground mb-2">{farm.name}</h1>
        <p className="text-muted-foreground mb-8">
          Enter your investment details below to proceed.
        </p>

        <form onSubmit={handleInvest}>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Farm Image Gallery */}
            <div className="flex-1">
              <ImageGallery
                images={getFarmImages(farm)}
                alt={farm.name}
                aspectRatio="wide"
              />
            </div>

            {/* Investment Form */}
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
                      {...form.getInputProps('amount')}
                      className="pl-7 text-lg"
                      min={farm.minimumInvestment}
                    />
                  </div>
                  {form.errors.amount && (
                    <p className="text-sm text-destructive mt-1">
                      {form.errors.amount}
                    </p>
                  )}
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
                    value={form.values.paymentMethod}
                    onValueChange={(value) =>
                      form.setFieldValue('paymentMethod', value)
                    }
                  >
                    <div
                      className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${form.values.paymentMethod === 'card' ? 'border-primary bg-secondary' : 'border-border'}`}
                      onClick={() =>
                        form.setFieldValue('paymentMethod', 'card')
                      }
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
                      className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors mt-2 ${form.values.paymentMethod === 'wallet' ? 'border-primary bg-secondary' : 'border-border'}`}
                      onClick={() =>
                        form.setFieldValue('paymentMethod', 'wallet')
                      }
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
                  type="submit"
                  className="w-full h-12 bg-primary text-primary-foreground font-semibold rounded-lg"
                  disabled={investMutation.isPending}
                >
                  {investMutation.isPending ? (
                    'Processing...'
                  ) : (
                    <>
                      Proceed to Payment
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-primary">
                  <Shield className="w-4 h-4" />
                  <span>Secure SSL Encryption Payment</span>
                </div>
              </div>
            </div>
          </div>
        </form>

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
    )
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Hero Image Gallery */}
      <div className="mb-8">
        <ImageGallery
          images={getFarmImages(farm)}
          alt={farm.name}
          className="relative"
          aspectRatio="hero"
        />
      </div>

      {/* Farm Name + Badge (moved outside hero) */}
      <div className="mb-8">
        <Badge
          variant="secondary"
          className="mb-2 w-fit px-3 py-1.5 text-xs tracking-wide"
        >
          Verified Project
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          {farm.name}
        </h1>
        <p className="text-muted-foreground font-medium text-base mt-1">
          Cultivating Prosperity in Rural Liberia
        </p>
      </div>

      {/* Tabs and Sidebar layout */}
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Main Content */}
        <div className="flex-1">
          <Tabs defaultValue="overview">
            <TabsList variant="underline">
              <TabsTrigger variant="underline" value="overview">
                Overview
              </TabsTrigger>
              <TabsTrigger variant="underline" value="updates">
                Updates ({farm.updates.length})
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
                  {farm.coordinates?.latitude != null &&
                  farm.coordinates.longitude ? (
                    <iframe
                      title={`Map for ${farm.location}`}
                      width="100%"
                      height="320"
                      style={{ border: 0 }}
                      loading="lazy"
                      className="w-full h-80"
                      src={`https://maps.google.com/maps?q=${farm.coordinates.latitude},${farm.coordinates.longitude}&z=13&output=embed`}
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-80 bg-muted/30 text-muted-foreground text-sm">
                      <p>{farm.location}</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="updates" className="mt-7">
              {farm.updates.length > 0 ? (
                <div className="space-y-4">
                  {[...farm.updates]
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime(),
                    )
                    .map((update, idx) => (
                      <div
                        key={idx}
                        className="bg-card border border-border rounded-lg p-4"
                      >
                        <p className="text-xs text-muted-foreground mb-0.5">
                          {new Date(update.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        <h4 className="font-semibold mb-1 text-foreground">
                          {update.stage}
                        </h4>
                        {update.image && (
                          <img
                            src={update.image}
                            alt={update.stage}
                            className="w-full h-48 object-cover rounded-md mt-2 border border-border"
                          />
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No updates yet for this farm.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 shrink-0 mt-10 lg:mt-0">
          <div className="bg-card border border-border rounded-xl p-5 sticky top-6 space-y-5">
            {/* Location & Duration */}
            <div className="space-y-3">
              <div>
                <p className="text-xs text-primary mb-1 flex items-center gap-1 uppercase tracking-wide">
                  <MapPin className="w-3 h-3" /> Location
                </p>
                <p className="font-medium text-foreground text-sm">
                  {farm.location}
                </p>
              </div>
              <div>
                <p className="text-xs text-primary mb-1 flex items-center gap-1 uppercase tracking-wide">
                  <Clock className="w-3 h-3" /> Duration
                </p>
                <p className="font-medium text-foreground text-sm">
                  {farm.durationMonths} Months
                </p>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* ROI & Goal */}
            <div className="space-y-3">
              <div>
                <p className="text-xs text-primary mb-1 flex items-center gap-1 uppercase tracking-wide">
                  <TrendingUp className="w-3 h-3" /> Projected ROI
                </p>
                <p className="font-medium text-foreground text-sm">
                  {farm.roi}% APY
                </p>
              </div>
              <div>
                <p className="text-xs text-primary mb-1 flex items-center gap-1 uppercase tracking-wide">
                  <Target className="w-3 h-3" /> Funding Goal
                </p>
                <p className="font-medium text-foreground text-sm">
                  {formatCurrency(farm.investmentGoal)}
                </p>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Funding Progress */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2 uppercase tracking-wide">
                <span className="text-primary font-semibold">
                  Funding Progress
                </span>
                <span className="font-medium text-foreground">{progress}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-[#F0F0F0] overflow-hidden relative w-full border border-border mb-2">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(farm.fundedAmount)} of{' '}
                {formatCurrency(farm.investmentGoal)}
              </p>
            </div>

            <div className="h-px bg-border" />

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <Button
                variant="outline"
                className="w-full h-11 font-medium rounded-lg border-2 border-primary text-primary hover:bg-secondary"
                onClick={handleWatchlistToggle}
                disabled={
                  addToWatchlist.isPending || removeFromWatchlist.isPending
                }
              >
                {isInWatchlist ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    In Watchlist
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Watchlist
                  </>
                )}
              </Button>
              <Button
                className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90"
                onClick={() => {}}
              >
                Invest Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
