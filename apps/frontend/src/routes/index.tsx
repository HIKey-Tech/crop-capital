import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: RootRoute,
})

function RootRoute() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                CC
              </span>
            </div>
            <span className="text-lg font-bold text-foreground">
              CropCapital
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button className="btn-primary-gradient">Access Platform</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 pt-16 md:pt-24 pb-14">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              Tenant launch infrastructure for agri-investment teams
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Launch Your Agricultural Investment Platform
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Onboard and operate tenants with confidence — configure branding,
              domain mapping, feature access, and user assignment before
              customer launch.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
              <Link to="/auth">
                <Button
                  size="lg"
                  className="btn-primary-gradient h-14 px-8 text-lg"
                >
                  Platform Sign In
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            <p className="text-sm text-muted-foreground mb-10">
              Need platform access? Email{' '}
              <a
                href="mailto:support@cropcapital.com"
                className="text-primary font-medium hover:underline"
              >
                support@cropcapital.com
              </a>
              .
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-2xl font-bold text-foreground">
                  Multi-tenant
                </p>
                <p className="text-sm text-muted-foreground">
                  Platform architecture
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-2xl font-bold text-foreground">Role-based</p>
                <p className="text-sm text-muted-foreground">
                  Access and approvals
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-2xl font-bold text-foreground">
                  Config-first
                </p>
                <p className="text-sm text-muted-foreground">
                  No-code tenant setup
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-14">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Create Tenant</h2>
              <p className="text-sm text-muted-foreground">
                Register tenant profile, slug, domains, and activation state in
                one flow.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mx-auto mb-4">
                <Settings2 className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Configure Features</h2>
              <p className="text-sm text-muted-foreground">
                Toggle modules like farms, investments, wallet, admin reports,
                and KYC.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Assign Users</h2>
              <p className="text-sm text-muted-foreground">
                Map pending and existing accounts into the correct tenant before
                go-live.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-20">
          <div className="max-w-5xl mx-auto rounded-2xl border border-border bg-card p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                  Built for controlled, scalable rollout
                </h2>
                <p className="text-muted-foreground mb-6">
                  Keep launch quality high with a platform workflow that
                  centralizes onboarding and minimizes tenant misconfiguration.
                </p>
                <Link to="/auth">
                  <Button className="btn-primary-gradient">
                    Sign In to Platform
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                  <ShieldCheck className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">
                      Role-safe entry
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Super-admin and tenant experiences are isolated by design.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">
                      Config consistency
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Branding, domains, and feature controls are managed in one
                      place.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">
                      Pre-launch readiness
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Assign users and validate tenant settings before customer
                      access.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
