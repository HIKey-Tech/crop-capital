import { Link, createFileRoute } from '@tanstack/react-router'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import { useTenant } from '@/contexts/tenant'

export const Route = createFileRoute('/$tenant/disclosures')({
  component: DisclosuresPage,
})

const sections = [
  {
    title: '1. Investment Risk Disclosure',
    body: 'Investing in agricultural assets involves significant risk. The value of your investment and the returns derived from it can go down as well as up. You may get back less than you invest, including the possibility of total capital loss. Past performance of any farm portfolio, crop cycle, or investment product is not indicative of future results.',
  },
  {
    title: '2. Agricultural & Environmental Risks',
    body: 'Agricultural investments are subject to risks inherent in farming operations, including but not limited to: adverse weather conditions (drought, flooding, frost), disease and pest infestations, soil degradation, water scarcity, and the unpredictability of crop yields. These events may materially reduce or eliminate returns for a given investment cycle.',
  },
  {
    title: '3. Market & Commodity Price Risk',
    body: 'The profitability of agricultural investments is partially dependent on the market prices of commodities at the time of harvest and sale. Commodity prices can be volatile and are influenced by global supply and demand dynamics, currency fluctuations, trade policy changes, and macroeconomic conditions beyond our control.',
  },
  {
    title: '4. Liquidity Risk',
    body: "Agricultural investments on this platform are illiquid. Your capital is committed for the full duration of the stated investment cycle and cannot be redeemed or transferred prior to the cycle's conclusion. There is no secondary market for these investments. You should only invest funds that you are prepared to hold for the full stated term.",
  },
  {
    title: '5. Regulatory & Compliance Risk',
    body: 'Agricultural investment activities are subject to regulation in various jurisdictions. Changes in applicable laws, regulations, or government policy — including land use, export restrictions, taxation, or environmental requirements — may adversely affect the performance of underlying farm operations.',
  },
  {
    title: '6. Operator & Management Risk',
    body: 'The performance of each farm investment depends significantly on the capability and continued operation of the farm managers and local partners. Failure of key personnel, operational mismanagement, or bankruptcy of an operator could negatively impact investment returns.',
  },
  {
    title: '7. Insurance Coverage Limitations',
    body: 'While all farm portfolios on this platform carry agricultural insurance, insurance policies are subject to coverage limits, exclusion clauses, and claims processing timelines. Insurance does not guarantee full capital recovery in all loss scenarios. Investors should not rely on insurance as a substitute for risk-appropriate capital allocation.',
  },
  {
    title: '8. Return Projections Are Estimates',
    body: 'Any projected or target returns presented on this platform are forward-looking estimates based on historical farm performance, current market conditions, and agronomic modelling. These projections are not guarantees. Actual returns may differ materially from stated targets due to the risks described in this document.',
  },
  {
    title: '9. Technology & Platform Risk',
    body: 'This platform relies on digital infrastructure, third-party payment processors, and data systems that may experience outages, security incidents, or failures. While we take extensive precautions, no technology system is fully immune to disruption. Investors should maintain independent records of their investment activity.',
  },
  {
    title: '10. No Financial Advice',
    body: 'Nothing on this platform constitutes financial, investment, tax, or legal advice. The information provided is for informational purposes only. Before investing, you should seek independent professional advice appropriate to your personal financial circumstances, investment objectives, and risk tolerance.',
  },
  {
    title: '11. Conflicts of Interest',
    body: 'The platform operator may have financial interests in the farm operations or related businesses listed on this platform. We are committed to managing conflicts of interest transparently. Full disclosure of any material conflicts is made available in the relevant investment product documentation.',
  },
  {
    title: '12. Suitability',
    body: 'Agricultural investments on this platform may not be suitable for all investors. These products are intended for investors who understand the risks of illiquid, real-asset investments and who can bear the potential loss of their invested capital. By proceeding to invest, you confirm that you meet the eligibility criteria and understand the risks involved.',
  },
]

function DisclosuresPage() {
  const { tenant: tenantParam } = Route.useParams()
  const { tenant } = useTenant()

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-2xl border-b border-border py-5 px-8">
        <div className="premium-container flex items-center justify-between">
          <Link
            to="/$tenant"
            params={{ tenant: tenantParam }}
            className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[11px] font-black uppercase tracking-[0.35em]">
              Back to {tenant.displayName}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black text-xs">
                {tenant.shortName}
              </span>
            </div>
            <span className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
              {tenant.displayName}
            </span>
          </div>
        </div>
      </nav>

      <div className="pt-28 pb-32">
        <div className="bg-secondary relative overflow-hidden py-20 lg:py-28 mb-0">
          <div className="absolute inset-0 dot-grid opacity-5" />
          <div className="premium-container relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-white/15 w-10" />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40">
                Legal Document
              </span>
            </div>
            <h1 className="text-display text-[clamp(3rem,6vw,7rem)] text-secondary-foreground mb-4">
              Disclosures
            </h1>
            <p className="text-base font-bold text-secondary-foreground/40 uppercase tracking-[0.25em]">
              Last updated: March 2026
            </p>
          </div>
        </div>

        <div className="premium-container max-w-4xl mx-auto pt-16">
          <div className="mb-12 p-8 border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 flex gap-5">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
            <p className="text-lg text-foreground/80 leading-relaxed font-medium">
              <strong className="text-foreground">Important:</strong>{' '}
              Agricultural investments carry significant risks including the
              potential loss of invested capital. Please read these disclosures
              carefully before making any investment decision. These disclosures
              form part of the Terms of Access for this platform.
            </p>
          </div>

          <div className="space-y-12">
            {sections.map((section, i) => (
              <div
                key={i}
                className="border-b border-border pb-12 last:border-b-0"
              >
                <h2 className="text-2xl lg:text-3xl font-black text-foreground mb-5 uppercase tracking-tight">
                  {section.title}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                  {section.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 p-8 border border-border bg-muted/40">
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              These disclosures are provided for informational purposes and do
              not constitute financial advice. For specific questions regarding
              investment suitability, please consult an independent financial
              adviser. Contact{' '}
              <a
                href={`mailto:${tenant.supportEmail || 'support@cropcapital.com'}`}
                className="text-primary hover:underline font-black"
              >
                {tenant.supportEmail || 'support@cropcapital.com'}
              </a>{' '}
              with any questions about this document.
            </p>
          </div>

          <div className="mt-16 pt-16 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">
              © {new Date().getFullYear()}{' '}
              {tenant.legalName || tenant.displayName}. All rights reserved.
            </p>
            <div className="flex gap-8">
              <Link
                to="/$tenant/privacy"
                params={{ tenant: tenantParam }}
                className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/$tenant/terms"
                params={{ tenant: tenantParam }}
                className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Access
              </Link>
              <Link
                to="/$tenant/support"
                params={{ tenant: tenantParam }}
                className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors"
              >
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
