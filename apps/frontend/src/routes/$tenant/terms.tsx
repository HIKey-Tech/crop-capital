import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, FileText } from 'lucide-react'
import { useTenant } from '@/contexts/tenant'

export const Route = createFileRoute('/$tenant/terms')({
  component: TermsPage,
})

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or using this investment platform, you agree to be bound by these Terms of Access and all applicable laws and regulations governing agricultural investment in your jurisdiction. If you do not agree to these terms, you may not access or use this platform.',
  },
  {
    title: '2. Investor Eligibility',
    body: 'Access to investment products on this platform is restricted to individuals and entities who meet applicable investor eligibility requirements, including age of majority, KYC verification, and where applicable, accredited or qualified investor status. We reserve the right to deny or revoke access at our discretion.',
  },
  {
    title: '3. Nature of Investments',
    body: 'Agricultural investments involve real-world assets subject to production risk, climate events, regulatory changes, and market price fluctuations. Returns are not guaranteed. Past performance of any farm portfolio or investment cycle is not indicative of future results. All investments carry a risk of partial or total loss of capital.',
  },
  {
    title: '4. Platform Use',
    body: 'You may use this platform solely for lawful investment purposes. You may not use the platform to engage in fraudulent activity, attempt to manipulate returns data, impersonate another investor, or circumvent KYC/AML controls. Violations may result in immediate account suspension and referral to relevant authorities.',
  },
  {
    title: '5. Account Responsibilities',
    body: 'You are solely responsible for maintaining the security of your login credentials. Any activity conducted through your account is your responsibility. You must notify us immediately if you suspect unauthorised access. We are not liable for losses resulting from your failure to maintain account security.',
  },
  {
    title: '6. Fees & Charges',
    body: 'The platform charges management fees and performance fees as disclosed at the point of investment. These fees are deducted from gross returns before distribution. Fee structures are subject to change with 30 days written notice. Detailed fee schedules are available in the investment product documentation.',
  },
  {
    title: '7. Distributions & Payouts',
    body: 'Returns are distributed quarterly following the completion of each harvest cycle and financial reconciliation. Distributions are subject to applicable withholding taxes in your jurisdiction. Payout timelines may vary due to delays in crop cycles, post-harvest processing, or banking operations outside our control.',
  },
  {
    title: '8. Data & Privacy',
    body: 'Your use of this platform is governed by our Privacy Policy. By using the platform, you consent to the collection and processing of your personal and financial data as described therein. You represent that all information provided during registration is accurate and current.',
  },
  {
    title: '9. Intellectual Property',
    body: 'All content on this platform — including platform software, farm data, reports, branding, and investment methodology — is proprietary. You are granted a limited, personal, non-transferable licence to access and use the platform solely for your own investment activities.',
  },
  {
    title: '10. Limitation of Liability',
    body: 'To the maximum extent permitted by law, the platform operator shall not be liable for any indirect, incidental, or consequential losses arising from the use of this platform, including but not limited to investment loss, data loss, or delays in distribution. Our total liability shall not exceed the fees paid by you in the prior 12 months.',
  },
  {
    title: '11. Governing Law',
    body: 'These Terms of Access are governed by applicable law. Disputes arising from these terms shall be subject to binding arbitration before escalation to courts of competent jurisdiction. You waive the right to participate in class-action proceedings related to these terms.',
  },
  {
    title: '12. Amendments',
    body: 'We may amend these Terms at any time. Material changes will be communicated via email with at least 14 days notice. Continued use of the platform after the effective date of amended terms constitutes your acceptance.',
  },
]

function TermsPage() {
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
                {tenant.shortName[0]}
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
              Terms of Access
            </h1>
            <p className="text-base font-bold text-secondary-foreground/40 uppercase tracking-[0.25em]">
              Last updated: March 2026
            </p>
          </div>
        </div>

        <div className="premium-container max-w-4xl mx-auto pt-16">
          <div className="mb-12 p-8 border border-border bg-primary/2.5 flex gap-5">
            <FileText className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <p className="text-lg text-muted-foreground leading-relaxed font-medium">
              These Terms of Access govern your use of the {tenant.displayName}{' '}
              investment platform. Agricultural investments involve risk —
              please review these terms and our Disclosures carefully before
              committing capital.
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
                to="/$tenant/support"
                params={{ tenant: tenantParam }}
                className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors"
              >
                Support
              </Link>
              <Link
                to="/$tenant/disclosures"
                params={{ tenant: tenantParam }}
                className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors"
              >
                Disclosures
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
