import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CreditCard,
  MapPin,
  ShieldCheck,
  Sprout,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading'
import { useFarm, useInvest } from '@/hooks'
import { getFarmImages } from '@/lib/farm-utils'
import { formatCurrency } from '@/lib/format-currency'

export const Route = createFileRoute(
  '/$tenant/_authenticated/farms/$id/invest',
)({
  component: InvestPage,
})

function InvestPage() {
  const { id, tenant } = Route.useParams()
  const navigate = useNavigate()
  const { data, isLoading } = useFarm(id)
  const investMutation = useInvest()

  const [amount, setAmount] = useState('')
  const [step, setStep] = useState(1)

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!data?.farm) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <div className="rounded-3xl border border-border bg-card px-6 py-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-foreground">
            Farm not found
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            This investment opportunity is no longer available.
          </p>
        </div>
      </div>
    )
  }

  const farm = data.farm
  const currency = farm.currency || 'NGN'
  const heroImage = getFarmImages(farm)[0]
  const investmentAmount = Number(amount)
  const hasAmount = Number.isFinite(investmentAmount) && investmentAmount > 0
  const meetsMinimum = hasAmount && investmentAmount >= farm.minimumInvestment
  const projectedPayout = hasAmount
    ? investmentAmount + (investmentAmount * farm.roi) / 100
    : 0
  const profit = projectedPayout - (hasAmount ? investmentAmount : 0)
  const fundingProgress = farm.investmentGoal
    ? Math.min(Math.round((farm.fundedAmount / farm.investmentGoal) * 100), 100)
    : 0

  const maturityDate = new Date()
  maturityDate.setMonth(maturityDate.getMonth() + farm.durationMonths)

  const handleContinue = () => {
    if (!meetsMinimum) {
      toast.error(
        `Minimum investment is ${formatCurrency(farm.minimumInvestment, currency)}`,
      )
      return
    }

    setStep(2)
  }

  const handleInvest = async () => {
    if (!meetsMinimum) {
      toast.error(
        `Minimum investment is ${formatCurrency(farm.minimumInvestment, currency)}`,
      )
      return
    }

    try {
      const response = await investMutation.mutateAsync({
        farmId: id,
        amount: investmentAmount,
      })

      if (response.authorizationUrl) {
        window.location.href = response.authorizationUrl
        return
      }

      toast.error('Payment initialization failed. Please try again.')
    } catch (error: unknown) {
      const err = error as Error
      toast.error(err.message || 'Investment failed. Please try again.')
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6 lg:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="ghost"
          className="h-10 rounded-full px-4 text-foreground"
          onClick={() =>
            navigate({
              to: '/$tenant/farms/$id',
              params: { tenant, id },
            })
          }
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to farm
        </Button>

        <div className="flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary shadow-sm">
          <ShieldCheck className="h-3.5 w-3.5" />
          Secure checkout via Paystack
        </div>
      </div>

      <section className="overflow-hidden rounded-4xl border border-border bg-card shadow-xl">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative min-h-70 overflow-hidden bg-muted">
            {heroImage ? (
              <img
                src={heroImage}
                alt={farm.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full min-h-70 items-center justify-center bg-linear-to-br from-primary/15 via-primary/5 to-background">
                <Sprout className="h-12 w-12 text-primary" />
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <Badge className="mb-3 border-white/20 bg-white/15 text-white shadow-sm backdrop-blur">
                Live investment offer
              </Badge>
              <h1 className="max-w-xl text-2xl font-semibold sm:text-3xl">
                Invest in {farm.name}
              </h1>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/85">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {farm.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" />
                  {farm.durationMonths} month cycle
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between bg-linear-to-br from-primary/10 via-primary/5 to-card p-6 sm:p-8">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary/80">
                Offer snapshot
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <SummaryCard
                  label="Minimum stake"
                  value={formatCurrency(farm.minimumInvestment, currency)}
                  icon={<CreditCard className="h-4 w-4" />}
                />
                <SummaryCard
                  label="Projected ROI"
                  value={`${farm.roi}%`}
                  icon={<TrendingUp className="h-4 w-4" />}
                />
                <SummaryCard
                  label="Funding progress"
                  value={`${fundingProgress}%`}
                  icon={<Sprout className="h-4 w-4" />}
                />
                <SummaryCard
                  label="Maturity target"
                  value={maturityDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  icon={<CalendarDays className="h-4 w-4" />}
                />
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-primary/15 bg-background/85 p-4 shadow-sm backdrop-blur">
              <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                <span>Raised so far</span>
                <span>{fundingProgress}%</span>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-primary/10">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${fundingProgress}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-foreground">
                {formatCurrency(farm.fundedAmount, currency)} funded of{' '}
                {formatCurrency(farm.investmentGoal, currency)} target.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-4xl border border-border bg-card p-6 shadow-lg sm:p-8">
          <div className="flex items-center gap-3">
            <StepBadge active={step === 1} complete={step > 1} number={1} />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Choose your amount
              </p>
              <p className="text-sm text-muted-foreground">
                Enter the amount you want to commit before checkout.
              </p>
            </div>
          </div>

          <div className="my-5 h-px bg-border" />

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Investment amount
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                  {currency}
                </span>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  min={farm.minimumInvestment}
                  className="h-14 rounded-2xl border-border pl-16 text-lg shadow-sm"
                />
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                <p className="text-muted-foreground">
                  Minimum investment is{' '}
                  {formatCurrency(farm.minimumInvestment, currency)}.
                </p>
                {hasAmount && !meetsMinimum ? (
                  <p className="font-medium text-destructive">
                    Enter at least{' '}
                    {formatCurrency(farm.minimumInvestment, currency)}.
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-foreground">
                Quick amounts
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {[50000, 100000, 500000].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAmount(String(value))}
                    className={`rounded-2xl border px-4 py-3 text-sm font-medium shadow-sm transition ${Number(amount) === value ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:border-primary/30 hover:bg-primary/5'}`}
                  >
                    {formatCurrency(value, currency)}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-primary/10 bg-primary/5 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-primary">
                    Estimated payout
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">
                    {hasAmount
                      ? formatCurrency(projectedPayout, currency)
                      : formatCurrency(0, currency)}
                  </p>
                </div>
                <div className="rounded-2xl border border-primary/15 bg-background px-4 py-3 text-right shadow-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Projected profit
                  </p>
                  <p className="mt-1 text-lg font-semibold text-primary">
                    {hasAmount
                      ? formatCurrency(profit, currency)
                      : formatCurrency(0, currency)}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Returns are projected using the current {farm.roi}% ROI for a{' '}
                {farm.durationMonths}-month cycle.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                className="h-12 rounded-full px-6 shadow-lg"
                onClick={handleContinue}
                disabled={!meetsMinimum}
              >
                Continue to confirmation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-sm text-muted-foreground">
                You will review the details before leaving for checkout.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-4xl border border-border bg-card p-6 shadow-lg sm:p-8">
          <div className="flex items-center gap-3">
            <StepBadge active={step === 2} complete={false} number={2} />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Confirm and pay
              </p>
              <p className="text-sm text-muted-foreground">
                Complete the checkout on Paystack.
              </p>
            </div>
          </div>

          <div className="my-5 h-px bg-border" />

          <div className="space-y-4">
            <div className="rounded-3xl border border-primary/15 bg-linear-to-br from-primary/10 via-primary/5 to-background p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-primary p-3 text-primary-foreground shadow-md">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">
                    Paystack protected payment
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your checkout is handled on Paystack with encrypted payment
                    processing and a unique transaction reference.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-background p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Investment summary
              </p>
              <div className="mt-4 space-y-3 text-sm">
                <SummaryRow label="Farm" value={farm.name} />
                <SummaryRow
                  label="Amount"
                  value={
                    hasAmount
                      ? formatCurrency(investmentAmount, currency)
                      : 'Not set'
                  }
                />
                <SummaryRow label="Projected ROI" value={`${farm.roi}%`} />
                <SummaryRow
                  label="Duration"
                  value={`${farm.durationMonths} months`}
                />
                <SummaryRow
                  label="Expected maturity"
                  value={maturityDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                />
              </div>

              <div className="mt-4 rounded-2xl border border-primary/10 bg-primary/5 p-4">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-medium text-foreground">
                    Projected payout
                  </span>
                  <span className="text-lg font-semibold text-primary">
                    {hasAmount
                      ? formatCurrency(projectedPayout, currency)
                      : formatCurrency(0, currency)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="h-12 flex-1 rounded-full"
                onClick={() => setStep(1)}
                disabled={investMutation.isPending}
              >
                Edit amount
              </Button>
              <Button
                type="button"
                className="h-12 flex-1 rounded-full shadow-lg"
                onClick={handleInvest}
                disabled={
                  step !== 2 || !meetsMinimum || investMutation.isPending
                }
              >
                {investMutation.isPending
                  ? 'Preparing checkout...'
                  : 'Continue to Paystack'}
                {!investMutation.isPending ? (
                  <ArrowRight className="ml-2 h-4 w-4" />
                ) : null}
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Once you continue, you will be redirected to Paystack to finish
              the payment with the amount shown above.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

function StepBadge({
  active,
  complete,
  number,
}: {
  active: boolean
  complete: boolean
  number: number
}) {
  return (
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold shadow-sm ${complete || active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted text-muted-foreground'}`}
    >
      {number}
    </div>
  )
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-3xl border border-primary/10 bg-background/90 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="mt-3 text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  )
}
