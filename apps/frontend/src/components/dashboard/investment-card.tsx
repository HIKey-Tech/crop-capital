import type { Farm, Investment } from '@/types'
import { formatCurrency } from '@/lib/format-currency'

// Helper to compute derived investment values
function computeInvestmentMetrics(investment: Investment, _farm: Farm) {
  const expectedReturn = investment.projectedReturn
  const investedDate = new Date(investment.createdAt)
  const expectedPayoutDate = new Date(investedDate)
  expectedPayoutDate.setMonth(
    expectedPayoutDate.getMonth() + investment.durationMonths,
  )

  const now = new Date()
  const totalDuration = expectedPayoutDate.getTime() - investedDate.getTime()
  const elapsed = now.getTime() - investedDate.getTime()
  const progress = Math.min(
    100,
    Math.max(0, Math.round((elapsed / totalDuration) * 100)),
  )
  const daysRemaining = Math.max(
    0,
    Math.ceil(
      (expectedPayoutDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    ),
  )

  return { expectedReturn, expectedPayoutDate, progress, daysRemaining }
}

interface InvestmentCardProps {
  investment: Investment
}

export function InvestmentCard({ investment }: InvestmentCardProps) {
  // Improved InfoPill for better visual contrast and spacing
  const InfoPill = ({
    label,
    value,
    bold,
  }: {
    label: string
    value: string | number
    bold?: boolean
  }) => (
    <span
      className={`inline-flex items-center rounded-md border px-3 py-1 text-[15px] font-medium mr-2 mb-2 whitespace-nowrap ${
        bold
          ? 'border-accent/30 bg-accent/10 text-accent'
          : 'border-border bg-muted text-foreground/90'
      }`}
    >
      {bold ? (
        <>
          <span className="font-semibold mr-1">{value}</span>
          {label}
        </>
      ) : (
        <>
          <span className="mr-1">{value}</span>
          {label}
        </>
      )}
    </span>
  )

  // Farm can be populated object or just an ID string
  const farm = typeof investment.farm === 'object' ? investment.farm : null

  if (!farm) {
    return (
      <div className="rounded-xl overflow-hidden border border-border bg-card p-5">
        <p className="text-muted-foreground">Loading farm details...</p>
      </div>
    )
  }

  const { expectedReturn, progress, daysRemaining } = computeInvestmentMetrics(
    investment,
    farm,
  )
  const currency = investment.currency

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-card transition-shadow duration-300 group">
      <div className="relative aspect-16/10 overflow-hidden">
        <img
          src={farm.images[0]}
          alt={farm.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-5 pb-4">
        {/* Title and Days Remaining */}
        <div className="flex items-baseline justify-between mb-1">
          <h3 className="font-bold text-xl text-foreground leading-snug truncate">
            {farm.name}
          </h3>
          <span className="ml-3 rounded-md border border-secondary/25 bg-secondary/10 px-2 py-0.5 text-xs font-semibold text-secondary">
            <span className="text-secondary font-bold">{daysRemaining}</span>{' '}
            Days Left
          </span>
        </div>
        <p className="text-base text-muted-foreground mb-1">{farm.location}</p>

        {/* Info Pills Row */}
        <div className="flex flex-wrap gap-1 mb-4">
          <InfoPill value={`${farm.roi}%`} label="ROI" bold />
          <InfoPill value={`${farm.durationMonths}`} label="Months" bold />
        </div>

        {/* Progress bar label */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className="uppercase tracking-wider text-muted-foreground">
              Cycle Progress
            </span>
            <span className="text-primary">{progress}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden relative">
            <div
              className="h-full rounded-full bg-accent"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        {/* Amount Invested & Expected Return */}
        <div className="flex items-center justify-between text-xs mb-4">
          <span>
            <span className="text-accent font-bold">
              {formatCurrency(investment.amount, currency)}
            </span>{' '}
            <span className="text-muted-foreground">invested</span>
          </span>
          <span>
            <span className="text-primary font-bold">
              {formatCurrency(expectedReturn, currency)}
            </span>{' '}
            <span className="text-muted-foreground">expected return</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            className="flex-1 h-10 rounded-lg border border-secondary/30 bg-card text-secondary font-semibold transition-colors hover:bg-secondary/10 focus:outline-none text-sm"
            type="button"
          >
            View Details
          </button>
          <button
            className="btn-primary-gradient flex-1 h-10 rounded-lg font-semibold focus:outline-none text-sm"
            type="button"
          >
            Invest Again
          </button>
        </div>
      </div>
    </div>
  )
}
