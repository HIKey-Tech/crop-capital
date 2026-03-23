import { createFileRoute } from '@tanstack/react-router'
import { useTenant } from '@/contexts/tenant'

export const Route = createFileRoute('/$tenant/terms')({
  component: TermsPage,
})

function TermsPage() {
  const { tenant } = useTenant()

  return (
    <div className="mx-auto max-w-4xl animate-fade-in space-y-8 px-4 py-10 sm:py-12">
      <div className="rounded-3xl border border-border bg-card/90 p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: January 2025</p>
      </div>

      <div className="prose max-w-none rounded-3xl border border-border bg-card/80 p-6 text-foreground/90 shadow-sm sm:p-8">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using the {tenant.displayName} platform, you agree
            to be bound by these Terms of Service...
          </p>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-xl font-semibold text-foreground">
            2. Investment Risks
          </h2>
          <p>
            You acknowledge that agricultural investments carry inherent risks
            including weather conditions, pests, and market price
            fluctuations...
          </p>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-xl font-semibold text-foreground">
            3. User Conduct
          </h2>
          <p>
            Users agree not to misuse the platform or engage in any fraudulent
            activities...
          </p>
        </section>
      </div>
    </div>
  )
}
