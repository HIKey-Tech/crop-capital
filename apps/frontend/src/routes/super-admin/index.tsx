import { Link, createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { Building2, Globe2, ShieldCheck, Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  getTenantActivationBadgeClassName,
  getTenantReadiness,
  getTenantReadinessAppearance,
  useTenants,
} from '@/lib/super-admin'

export const Route = createFileRoute('/super-admin/')({
  component: OverviewPage,
})

function OverviewPage() {
  const { sortedTenants, tenantStats, tenantsQuery } = useTenants()

  const readinessStats = useMemo(() => {
    const summaries = sortedTenants.map((t) => getTenantReadiness(t))
    return {
      launchReady: summaries.filter((r) => r.status === 'launch-ready').length,
      demoReady: summaries.filter((r) => r.status === 'demo-ready').length,
      needsAttention: summaries.filter((r) => r.status === 'needs-attention')
        .length,
    }
  }, [sortedTenants])

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      <header className="rounded-3xl border border-border/70 bg-[radial-gradient(circle_at_top_left,rgba(33,134,65,0.12),transparent_40%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(245,248,244,0.92))] p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              Landlord Console
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Tenant Overview
            </h1>
            <p className="text-base text-muted-foreground">
              Create, configure, and maintain tenant spaces without stepping
              into tenant investor operations.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-120">
            <div className="rounded-2xl border border-border/70 bg-background/85 p-4 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Tenants
              </div>
              <div className="mt-2 text-2xl font-semibold text-foreground">
                {tenantStats.total}
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-emerald-700">
                Active
              </div>
              <div className="mt-2 text-2xl font-semibold text-emerald-900">
                {tenantStats.active}
              </div>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-amber-700">
                Inactive
              </div>
              <div className="mt-2 text-2xl font-semibold text-amber-900">
                {tenantStats.inactive}
              </div>
            </div>
            <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-4 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-sky-700">
                Domains Set
              </div>
              <div className="mt-2 text-2xl font-semibold text-sky-900">
                {tenantStats.withDomains}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Link
          to="/super-admin/tenants"
          className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          <Building2 className="w-8 h-8 text-primary mb-3" />
          <h2 className="font-semibold text-lg text-foreground">Tenants</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, edit, and manage tenant configurations, branding, and
            feature toggles.
          </p>
          <div className="mt-4 text-sm font-medium text-primary group-hover:underline">
            {tenantsQuery.isLoading
              ? 'Loading...'
              : `${tenantStats.total} tenants \u2192`}
          </div>
        </Link>

        <Link
          to="/super-admin/access"
          className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          <Globe2 className="w-8 h-8 text-primary mb-3" />
          <h2 className="font-semibold text-lg text-foreground">
            Access Guide
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            View entry points, sign-in URLs, and demo routes for every tenant
            workspace.
          </p>
          <div className="mt-4 text-sm font-medium text-primary group-hover:underline">
            View access URLs &rarr;
          </div>
        </Link>

        <Link
          to="/super-admin/readiness"
          className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          <ShieldCheck className="w-8 h-8 text-primary mb-3" />
          <h2 className="font-semibold text-lg text-foreground">
            Launch Readiness
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Track production-readiness scores and outstanding blockers for each
            tenant.
          </p>
          <div className="mt-4 text-sm font-medium text-primary group-hover:underline">
            {readinessStats.launchReady} launch-ready &middot;{' '}
            {readinessStats.needsAttention} need attention &rarr;
          </div>
        </Link>
      </div>

      {sortedTenants.length > 0 && (
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-lg">Tenants at a Glance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Tenant
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Slug
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Readiness
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Domains
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedTenants.map((tenant) => {
                  const readiness = getTenantReadiness(tenant)
                  const readinessAppearance = getTenantReadinessAppearance(
                    readiness.status,
                  )
                  return (
                    <tr
                      key={tenant.id}
                      className="border-b border-border last:border-0 transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 font-medium">{tenant.name}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                        {tenant.slug}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={tenant.isActive ? 'default' : 'secondary'}
                          className={getTenantActivationBadgeClassName(
                            tenant.isActive,
                          )}
                        >
                          {tenant.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={readinessAppearance.badgeClassName}
                        >
                          {readinessAppearance.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {tenant.domains.length
                          ? tenant.domains.join(', ')
                          : '\u2014'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
