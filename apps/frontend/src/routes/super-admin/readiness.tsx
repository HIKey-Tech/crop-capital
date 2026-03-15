import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { CheckCircle2, TriangleAlert } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { getTenantReadiness, useTenants } from '@/lib/super-admin'

export const Route = createFileRoute('/super-admin/readiness')({
  component: ReadinessPage,
})

function ReadinessPage() {
  const { sortedTenants } = useTenants()

  const readinessSummaries = useMemo(
    () =>
      sortedTenants.map((tenant) => ({
        tenant,
        readiness: getTenantReadiness(tenant),
      })),
    [sortedTenants],
  )

  const readinessStats = useMemo(
    () => ({
      launchReady: readinessSummaries.filter(
        ({ readiness }) => readiness.status === 'launch-ready',
      ).length,
      demoReady: readinessSummaries.filter(
        ({ readiness }) => readiness.status === 'demo-ready',
      ).length,
      needsAttention: readinessSummaries.filter(
        ({ readiness }) => readiness.status === 'needs-attention',
      ).length,
    }),
    [readinessSummaries],
  )

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Launch Readiness
        </h1>
        <p className="text-sm text-muted-foreground">
          Track whether each tenant is ready for production launch, only ready
          for local demo use, or still missing key setup requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-emerald-700">
            Launch Ready
          </div>
          <div className="mt-2 text-2xl font-semibold text-emerald-900">
            {readinessStats.launchReady}
          </div>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-4 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-sky-700">
            Demo Ready
          </div>
          <div className="mt-2 text-2xl font-semibold text-sky-900">
            {readinessStats.demoReady}
          </div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-amber-700">
            Needs Attention
          </div>
          <div className="mt-2 text-2xl font-semibold text-amber-900">
            {readinessStats.needsAttention}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {readinessSummaries.map(({ tenant, readiness }) => {
          const [passed, total] = readiness.score.split('/').map(Number)
          const pct = total > 0 ? (passed / total) * 100 : 0

          return (
            <article
              key={`${tenant.id}-readiness`}
              className="rounded-2xl border border-border bg-card shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {tenant.branding.displayName || tenant.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Score: {readiness.score}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    readiness.status === 'launch-ready'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : readiness.status === 'demo-ready'
                        ? 'border-sky-200 bg-sky-50 text-sky-800'
                        : 'border-amber-200 bg-amber-50 text-amber-900'
                  }
                >
                  {readiness.status === 'launch-ready'
                    ? 'Launch Ready'
                    : readiness.status === 'demo-ready'
                      ? 'Demo Ready'
                      : 'Needs Attention'}
                </Badge>
              </div>

              <div className="p-5 space-y-3">
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      readiness.status === 'launch-ready'
                        ? 'bg-emerald-500'
                        : readiness.status === 'demo-ready'
                          ? 'bg-sky-500'
                          : 'bg-amber-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {readiness.blockers.length === 0 ? (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-sm text-emerald-900">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    This tenant meets the current launch checklist.
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-sm text-amber-950">
                    <div className="flex items-center gap-2 font-medium">
                      <TriangleAlert className="h-4 w-4 shrink-0" />
                      Remaining blockers
                    </div>
                    <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
                      {readiness.blockers.map((blocker) => (
                        <li key={`${tenant.id}-${blocker}`}>{blocker}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </article>
          )
        })}

        {sortedTenants.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full">
            No tenants found. Create a tenant first to see readiness data.
          </p>
        )}
      </div>
    </div>
  )
}
