import { Link, createFileRoute } from '@tanstack/react-router'

import { ArrowRight, Shield, TrendingUp, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useTenant } from '@/contexts/tenant'

import farmPalmTrees from '@/assets/farm-palm-trees.jpg'

export const Route = createFileRoute('/$tenant/')({
  component: LandingPage,
})

function LandingPage() {
  const { tenant: tenantParam } = Route.useParams()
  const { tenant } = useTenant()
  const isExternalTerms = Boolean(tenant.termsUrl?.startsWith('http'))
  const isExternalPrivacy = Boolean(tenant.privacyUrl?.startsWith('http'))

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            to="/$tenant"
            params={{ tenant: tenantParam }}
            className="flex items-center gap-2"
          >
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              {tenant.logoUrl ? (
                <img
                  src={tenant.logoUrl}
                  alt={tenant.displayName}
                  className="w-6 h-6 object-contain"
                />
              ) : (
                <span className="text-primary-foreground font-bold text-sm">
                  {tenant.shortName}
                </span>
              )}
            </div>
            <span className="text-lg font-bold text-foreground">
              {tenant.displayName}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              How it Works
            </a>
            <a
              href="#farms"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Farms
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/$tenant/auth" params={{ tenant: tenantParam }}>
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/$tenant/auth" params={{ tenant: tenantParam }}>
              <Button className="btn-primary-gradient">
                {tenant.ctaPrimaryLabel}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.12),transparent_24%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--hue-primary)_28%_97%))]" />
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/85 px-4 py-2 text-sm font-medium text-primary shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Community-backed agricultural growth
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              {tenant.heroTitle}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {tenant.heroDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/$tenant/auth" params={{ tenant: tenantParam }}>
                <Button
                  size="lg"
                  className="btn-primary-gradient h-14 px-8 text-lg"
                >
                  {tenant.ctaPrimaryLabel}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/$tenant/farms" params={{ tenant: tenantParam }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 border-primary/15 bg-background/88 px-8 text-lg shadow-sm backdrop-blur hover:bg-primary/5"
                >
                  {tenant.ctaSecondaryLabel}
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div className="mt-16 relative">
            <div className="aspect-7/3 overflow-hidden rounded-3xl border border-white/60 shadow-2xl shadow-primary/15">
              <img
                src={farmPalmTrees}
                alt="African palm tree farm"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(8,15,10,0.12)_40%,rgba(8,15,10,0.38)_100%)]" />
            </div>

            {/* Floating Stats */}
            <div className="mx-auto mt-5 grid max-w-4xl grid-cols-3 gap-3 sm:absolute sm:-bottom-8 sm:left-1/2 sm:mt-0 sm:flex sm:-translate-x-1/2 sm:gap-4">
              <div
                className="rounded-xl border border-primary/12 px-3 py-3 text-center shadow-xl shadow-slate-950/10 backdrop-blur sm:px-6 sm:py-4 sm:text-left"
                style={{
                  backgroundImage:
                    'linear-gradient(180deg, hsl(var(--background) / 0.96) 0%, hsl(var(--hue-primary) 18% 97% / 0.9) 100%)',
                }}
              >
                <div className="mb-2 h-1.5 w-12 rounded-full bg-primary/18 sm:mb-3" />
                <p className="text-lg font-bold text-foreground sm:text-2xl">
                  $11.8M+
                </p>
                <p className="text-xs text-foreground/55 sm:text-sm">
                  Total Invested
                </p>
              </div>
              <div
                className="rounded-xl border border-primary/12 px-3 py-3 text-center shadow-xl shadow-slate-950/10 backdrop-blur sm:px-6 sm:py-4 sm:text-left"
                style={{
                  backgroundImage:
                    'linear-gradient(180deg, hsl(var(--background) / 0.96) 0%, hsl(var(--hue-primary) 16% 97% / 0.88) 100%)',
                }}
              >
                <div className="mb-2 h-1.5 w-12 rounded-full bg-primary/18 sm:mb-3" />
                <p className="text-lg font-bold text-foreground sm:text-2xl">
                  2,500+
                </p>
                <p className="text-xs text-foreground/55 sm:text-sm">
                  Active Investors
                </p>
              </div>
              <div
                className="rounded-xl border border-primary/20 px-3 py-3 text-center shadow-xl shadow-primary/12 backdrop-blur sm:px-6 sm:py-4 sm:text-left"
                style={{
                  backgroundImage:
                    'linear-gradient(180deg, hsl(var(--background) / 0.96) 0%, hsl(var(--hue-primary) 36% 95% / 0.92) 100%)',
                }}
              >
                <div className="mb-2 h-1.5 w-12 rounded-full bg-primary/70 sm:mb-3" />
                <p className="text-lg font-bold text-primary sm:text-2xl">
                  18.5%
                </p>
                <p className="text-xs text-foreground/60 sm:text-sm">
                  Avg. ROI
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="px-4 py-20"
        style={{
          backgroundImage:
            'linear-gradient(180deg, hsl(var(--hue-primary) 24% 96%) 0%, hsl(var(--background)) 100%)',
        }}
      >
        <div className="container mx-auto">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Why {tenant.shortName} stands out
            </p>
            <h2 className="text-3xl font-bold text-center text-foreground">
              Why Invest with {tenant.shortName}?
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div
              className="rounded-4xl border border-primary/10 p-8 text-center shadow-[0_18px_50px_-30px_hsl(var(--hue-primary)_55%_26%/0.18)] transition-transform duration-300 hover:-translate-y-1"
              style={{
                backgroundImage:
                  'linear-gradient(160deg, hsl(var(--background)) 0%, hsl(var(--hue-primary) 32% 97%) 100%)',
              }}
            >
              <div
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-primary/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
                style={{
                  backgroundImage:
                    'linear-gradient(145deg, hsl(var(--hue-primary) 58% 36% / 0.15), hsl(var(--hue-primary) 82% 52% / 0.2))',
                }}
              >
                <TrendingUp className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-foreground">
                High Returns
              </h3>
              <p className="text-[15px] leading-7 text-foreground/68">
                Earn up to 20% annual returns on verified agricultural
                investments.
              </p>
            </div>

            <div
              className="rounded-4xl border border-primary/12 p-8 text-center shadow-[0_20px_55px_-32px_hsl(var(--hue-primary)_55%_26%/0.22)] transition-transform duration-300 hover:-translate-y-1"
              style={{
                backgroundImage:
                  'linear-gradient(180deg, hsl(var(--hue-primary) 38% 96%) 0%, hsl(var(--background)) 46%, hsl(var(--hue-primary) 34% 95%) 100%)',
              }}
            >
              <div
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-primary/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]"
                style={{
                  backgroundImage:
                    'linear-gradient(145deg, hsl(var(--hue-primary) 58% 34% / 0.18), hsl(var(--hue-primary) 85% 50% / 0.24))',
                }}
              >
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-foreground">
                Verified Projects
              </h3>
              <p className="text-[15px] leading-7 text-foreground/68">
                All farms are vetted and verified before listing on our
                platform.
              </p>
            </div>

            <div
              className="rounded-4xl border border-primary/10 p-8 text-center shadow-[0_18px_50px_-30px_hsl(var(--hue-primary)_55%_26%/0.16)] transition-transform duration-300 hover:-translate-y-1"
              style={{
                backgroundImage:
                  'linear-gradient(200deg, hsl(var(--background)) 10%, hsl(var(--hue-primary) 28% 97%) 100%)',
              }}
            >
              <div
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-primary/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
                style={{
                  backgroundImage:
                    'linear-gradient(145deg, hsl(var(--hue-primary) 52% 34% / 0.14), hsl(var(--hue-primary) 78% 48% / 0.18))',
                }}
              >
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-foreground">
                Community Impact
              </h3>
              <p className="text-[15px] leading-7 text-foreground/68">
                Your investment directly supports local farmers and communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="mx-auto max-w-5xl rounded-4xl border border-primary/15 px-6 py-12 text-center shadow-2xl shadow-primary/15 sm:px-10 lg:px-16">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-4 py-2 text-sm font-medium text-primary">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Long-term agricultural upside
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to start with {tenant.displayName}?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {tenant.tagline}
            </p>
            <Link to="/$tenant/auth" params={{ tenant: tenantParam }}>
              <Button
                size="lg"
                className="btn-primary-gradient h-14 px-8 text-lg"
              >
                {tenant.ctaPrimaryLabel}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border bg-muted/40">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                {tenant.logoUrl ? (
                  <img
                    src={tenant.logoUrl}
                    alt={tenant.displayName}
                    className="w-5 h-5 object-contain"
                  />
                ) : (
                  <span className="text-primary-foreground font-bold text-xs">
                    {tenant.shortName}
                  </span>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {tenant.legalName}. All rights
                reserved.
              </span>
            </div>
            {tenant.websiteUrl && (
              <a
                href={tenant.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Visit Website
              </a>
            )}
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a
              href={tenant.privacyUrl || '/privacy'}
              target={isExternalPrivacy ? '_blank' : undefined}
              rel={isExternalPrivacy ? 'noreferrer' : undefined}
              className="hover:text-foreground"
            >
              Privacy Policy
            </a>
            <a
              href={tenant.termsUrl || '/terms'}
              target={isExternalTerms ? '_blank' : undefined}
              rel={isExternalTerms ? 'noreferrer' : undefined}
              className="hover:text-foreground"
            >
              Terms of Service
            </a>
            <a
              href={`/${tenantParam}/support`}
              className="hover:text-foreground"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
