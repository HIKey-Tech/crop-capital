import type { Farm, Investment } from '@/types'

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
      className={`inline-flex items-center px-3 py-1 rounded-md ${
        bold ? 'bg-[#FFF8E1] text-[#AB8300]' : 'bg-muted text-foreground/90'
      } text-[15px] font-medium mr-2 mb-2 whitespace-nowrap`}
      style={bold ? { border: '1px solid #FFD740' } : {}}
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
      <div className="rounded-xl overflow-hidden border border-border bg-white p-5">
        <p className="text-muted-foreground">Loading farm details...</p>
      </div>
    )
  }

  const { expectedReturn, progress, daysRemaining } = computeInvestmentMetrics(
    investment,
    farm,
  )

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-white transition-shadow duration-300 group">
      <div className="relative aspect-16/10 overflow-hidden">
        <img
          src={farm.image}
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
          <span className="ml-3 text-xs text-foreground/70 font-semibold px-2 py-0.5 rounded bg-accent">
            <span className="text-primary font-bold">{daysRemaining}</span> Days
            Left
          </span>
        </div>
        <p className="text-base text-gray-500 mb-1">{farm.location}</p>

        {/* Info Pills Row */}
        <div className="flex flex-wrap gap-1 mb-4">
          <InfoPill value={`${farm.roi}%`} label="ROI" bold />
          <InfoPill value={`${farm.durationMonths}`} label="Months" bold />
        </div>

        {/* Progress bar label */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className="uppercase tracking-wider text-[#A6A6A6]">
              Cycle Progress
            </span>
            <span className="text-primary">{progress}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-[#ECECEC] overflow-hidden relative">
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: '#FFD740',
              }}
            />
          </div>
        </div>

        {/* Amount Invested & Expected Return */}
        <div className="flex items-center justify-between text-xs mb-4">
          <span>
            <span className="text-[#807300] font-bold">
              ${investment.amount.toLocaleString()}
            </span>{' '}
            <span className="text-muted-foreground">invested</span>
          </span>
          <span>
            <span className="text-green-700 font-bold">
              ${expectedReturn.toLocaleString()}
            </span>{' '}
            <span className="text-muted-foreground">expected return</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            className="flex-1 h-10 border border-primary text-primary font-semibold bg-white rounded-lg transition-colors hover:bg-accent focus:outline-none text-sm"
            type="button"
          >
            View Details
          </button>
          <button
            className="flex-1 h-10 bg-primary text-white font-semibold rounded-lg transition-colors hover:brightness-105 focus:outline-none text-sm"
            type="button"
          >
            Invest Again
          </button>
        </div>
      </div>
    </div>
  )
}
