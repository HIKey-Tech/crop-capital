import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import {
  Copy,
  ExternalLink,
  Globe2,
  RouteIcon,
  ShoppingBag,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  getBrowserOrigin,
  getTenantAccessUrls,
  getTenantActivationBadgeClassName,
  useTenants,
} from '@/lib/super-admin'

export const Route = createFileRoute('/super-admin/access')({
  component: AccessGuidePage,
})

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  } catch {
    toast.error('Unable to copy link')
  }
}

function AccessGuidePage() {
  const { sortedTenants } = useTenants()
  const browserOrigin = useMemo(() => getBrowserOrigin(), [])

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Tenant Access Guide
        </h1>
        <p className="text-sm text-muted-foreground">
          Entry points and demo routes for every tenant workspace. Share these
          URLs with operators the moment a new workspace goes live.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {sortedTenants.map((tenant) => {
          const access = getTenantAccessUrls(tenant, browserOrigin)

          return (
            <article
              key={`${tenant.id}-access`}
              className="rounded-2xl border border-border bg-card shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {tenant.branding.displayName || tenant.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground font-mono">
                    /{tenant.slug}
                  </p>
                </div>
                <Badge
                  variant={tenant.isActive ? 'default' : 'secondary'}
                  className={getTenantActivationBadgeClassName(tenant.isActive)}
                >
                  {tenant.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="p-5 space-y-3">
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                      <Globe2 className="h-3.5 w-3.5" />
                      Preferred Entry
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => copyToClipboard(access.investorSignInUrl)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <a
                    href={access.investorSignInUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1.5 inline-flex items-center gap-2 break-all text-sm font-medium text-primary hover:underline"
                  >
                    {access.investorSignInUrl}
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </a>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <RouteIcon className="h-3.5 w-3.5" />
                      Local Demo Route
                    </div>
                    <p className="mt-1.5 break-all text-sm text-foreground">
                      {access.localDemoBaseUrl}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Tenant Dashboard
                    </div>
                    <p className="mt-1.5 break-all text-sm text-foreground">
                      {access.tenantDashboardUrl}
                    </p>
                  </div>
                </div>

                {(tenant.features.marketplace ||
                  tenant.features.adminMarketplace) && (
                  <div className="rounded-xl border border-amber-200/70 bg-amber-50/70 p-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-900">
                      <ShoppingBag className="h-3.5 w-3.5" />
                      Marketplace Routes
                    </div>
                    <div className="mt-2 space-y-2 text-sm">
                      {tenant.features.marketplace && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Investor Marketplace
                            </span>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() =>
                                copyToClipboard(access.marketplaceUrl)
                              }
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <a
                            href={access.marketplaceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 break-all text-sm font-medium text-foreground hover:underline"
                          >
                            {access.marketplaceUrl}
                            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                          </a>
                          <p className="break-all text-xs text-muted-foreground">
                            Orders: {access.marketplaceOrdersUrl}
                          </p>
                        </div>
                      )}

                      {tenant.features.adminMarketplace && (
                        <div className="space-y-1 border-t border-amber-200/70 pt-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Admin Marketplace
                            </span>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() =>
                                copyToClipboard(access.adminMarketplaceUrl)
                              }
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <a
                            href={access.adminMarketplaceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 break-all text-sm font-medium text-foreground hover:underline"
                          >
                            {access.adminMarketplaceUrl}
                            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                          </a>
                          <p className="break-all text-xs text-muted-foreground">
                            Orders: {access.adminMarketplaceOrdersUrl}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
                  {tenant.domains.length > 0
                    ? `Custom domain: ${tenant.domains.join(', ')}`
                    : 'No custom domain configured. Use the local slug route for demos until production domains are mapped.'}
                </div>
              </div>
            </article>
          )
        })}

        {sortedTenants.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full">
            No tenants found. Create a tenant first to see access URLs.
          </p>
        )}
      </div>
    </div>
  )
}
