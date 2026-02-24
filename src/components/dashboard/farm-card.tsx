import { Link } from '@tanstack/react-router'
import type { Farm } from '@/types'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { calculateFundingProgress } from '@/lib/farm-utils'

interface InfoPillProps {
  label: string
  value: string | number
  bold?: boolean
}

function InfoPill({ label, value, bold }: InfoPillProps) {
  return (
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
}

interface FarmCardProps {
  farm: Farm
  variant?: 'default' | 'compact'
}

export function FarmCard({ farm, variant = 'default' }: FarmCardProps) {
  const progress = calculateFundingProgress(farm)

  // Determine status based on funding
  const isFunded = progress >= 100
  const status = isFunded ? 'active' : 'funding'

  const statusBadge = {
    funding: (
      <Badge className="text-xs px-2.5 py-0.5 rounded bg-yellow-100 text-yellow-800">
        Funding
      </Badge>
    ),
    active: (
      <Badge className="text-xs px-2.5 py-0.5 rounded bg-green-100 text-green-800">
        Active
      </Badge>
    ),
  }

  if (variant === 'compact') {
    return (
      <div className="card-elevated rounded-xl overflow-hidden border border-border">
        <div className="flex items-center gap-4 p-4">
          <img
            src={farm.images[0]}
            alt={farm.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {statusBadge[status]}
            </div>
            <h3 className="font-semibold text-foreground truncate">
              {farm.name}
            </h3>
            <p className="text-sm text-muted-foreground">{farm.location}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card-elevated rounded-xl overflow-hidden border border-border bg-white transition-shadow duration-300 group h-full flex flex-col">
      <div className="relative aspect-16/10 overflow-hidden">
        <img
          src={farm.images[0]}
          alt={farm.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 z-10">{statusBadge[status]}</div>
      </div>
      <div className="p-4 pb-3 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-2xl leading-snug text-foreground mb-1">
            {farm.name}
          </h3>
        </div>
        <p className="text-base text-gray-500 mb-1">{farm.location}</p>
        <div className="flex flex-wrap gap-0.5 mb-4">
          <InfoPill value={`${farm.roi}%`} label="ROI" bold />
          <InfoPill value={`${farm.durationMonths}`} label="Months" bold />
        </div>

        <div className="mb-3 flex-1 flex flex-col justify-end">
          <div className="flex items-center justify-between text-xs font-medium mb-1">
            <span className="uppercase tracking-wider text-[#A6A6A6]">
              Funding
            </span>
            <span className="text-primary">{progress}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-[#F0F0F0] overflow-hidden relative">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <Link to="/farms/$id" params={{ id: farm._id }} className="w-1/2">
            <Button
              className="w-full h-11 border-2 border-[#39A86B] text-[#218641] font-semibold bg-white rounded-lg transition-colors hover:bg-accent focus:outline-none text-base"
              type="button"
              variant="outline"
            >
              <span className="inline-block font-semibold tracking-tight">
                View Details
              </span>
            </Button>
          </Link>
          <Link
            to="/farms/$id"
            params={{ id: farm._id }}
            search={{ invest: true }}
            className="w-1/2"
          >
            <Button
              className="w-full h-11 bg-[#218641] text-white font-bold rounded-lg transition-colors hover:brightness-110 focus:outline-none text-base"
              type="button"
            >
              <span className="inline-block font-bold tracking-tight">
                Invest Now
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
