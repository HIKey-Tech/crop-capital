import { Link, useParams } from '@tanstack/react-router'
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
      className={`inline-flex items-center rounded-md border px-3 py-1 text-[15px] font-medium mr-2 mb-2 whitespace-nowrap ${
        bold
          ? 'border-brand-accent/30 bg-accent text-accent-foreground'
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
}

interface FarmCardProps {
  farm: Farm
  variant?: 'default' | 'compact'
}

export function FarmCard({ farm, variant = 'default' }: FarmCardProps) {
  const params = useParams({ strict: false })
  const tenant = params.tenant ?? ''
  const progress = calculateFundingProgress(farm)

  // Determine status based on funding
  const isFunded = progress >= 100
  const status = isFunded ? 'active' : 'funding'

  const statusBadge = {
    funding: <Badge className="badge-brand-accent">Funding</Badge>,
    active: <Badge className="badge-brand-secondary">Active</Badge>,
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
    <div className="card-elevated rounded-xl overflow-hidden border border-border bg-card transition-shadow duration-300 group h-full flex flex-col">
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
        <p className="text-base text-muted-foreground mb-1">{farm.location}</p>
        <div className="flex flex-wrap gap-0.5 mb-4">
          <InfoPill value={`${farm.roi}%`} label="ROI" bold />
          <InfoPill value={`${farm.durationMonths}`} label="Months" bold />
        </div>

        <div className="mb-3 flex-1 flex flex-col justify-end">
          <div className="flex items-center justify-between text-xs font-medium mb-1">
            <span className="uppercase tracking-wider text-muted-foreground">
              Funding
            </span>
            <span className="text-primary">{progress}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden relative">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <Link
            to="/$tenant/farms/$id"
            params={{ tenant, id: farm._id }}
            className="w-1/2"
          >
            <Button
              className="w-full h-11 border-2 border-brand-secondary/30 text-brand-secondary font-semibold bg-card rounded-lg transition-colors hover:bg-secondary focus:outline-none text-base"
              type="button"
              variant="outline"
            >
              <span className="inline-block font-semibold tracking-tight">
                View Details
              </span>
            </Button>
          </Link>
          <Link
            to="/$tenant/farms/$id"
            params={{ tenant, id: farm._id }}
            search={{ invest: true }}
            className="w-1/2"
          >
            <Button
              className="btn-primary-gradient w-full h-11 font-bold rounded-lg focus:outline-none text-base"
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
