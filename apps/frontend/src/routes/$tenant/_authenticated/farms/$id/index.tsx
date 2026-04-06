import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import {
  ArrowRight,
  Check,
  Clock,
  DollarSign,
  MapPin,
  Plus,
  Target,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'

import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useAddToWatchlist,
  useFarm,
  useIsInWatchlist,
  useRemoveFromWatchlist,
} from '@/hooks'
import { formatCurrency } from '@/lib/format-currency'
import { getFarmImages } from '@/lib/farm-utils'
import { ImageGallery } from '@/components/ui/image-gallery'
import { LoadingSpinner } from '@/components/ui/loading'

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

export const Route = createFileRoute('/$tenant/_authenticated/farms/$id/')({
  validateSearch: z.object({ invest: z.boolean().optional() }),
  component: FarmDetailsPage,
})

function FarmDetailsPage() {
  const { id, tenant } = Route.useParams()
  const { invest = false } = Route.useSearch()

  const { data, isLoading, error } = useFarm(id)
  const isInWatchlist = useIsInWatchlist(id)
  const addToWatchlist = useAddToWatchlist()
  const removeFromWatchlist = useRemoveFromWatchlist()

  const navigate = useNavigate()

  useEffect(() => {
    if (!invest) return

    navigate({
      to: '/$tenant/farms/$id/invest',
      params: { tenant, id },
      replace: true,
    })
  }, [id, invest, navigate, tenant])

  const handleWatchlistToggle = async () => {
    try {
      if (isInWatchlist) {
        await removeFromWatchlist.mutateAsync(id)
        toast.success('Removed from watchlist')
      } else {
        await addToWatchlist.mutateAsync(id)
        toast.success('Added to watchlist')
      }
    } catch {
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
  const currency = farm.currency
  const progress = calculateFundingProgress(
    farm.fundedAmount,
    farm.investmentGoal,
  )

  if (invest) {
    return <LoadingSpinner />
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
                    value={formatCurrency(farm.minimumInvestment, currency)}
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
                  {formatCurrency(farm.investmentGoal, currency)}
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
                {formatCurrency(farm.fundedAmount, currency)} of{' '}
                {formatCurrency(farm.investmentGoal, currency)}
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
                onClick={() =>
                  navigate({
                    to: '/$tenant/farms/$id/invest',
                    params: { tenant, id },
                  })
                }
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
