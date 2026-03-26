import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, Shield } from 'lucide-react'
import { useTenant } from '@/contexts/tenant'

export const Route = createFileRoute('/$tenant/privacy')({
  component: PrivacyPage,
})

const sections = [
  {
    title: '1. Information We Collect',
    body: 'We collect personal information you provide directly — including your name, email address, phone number, residential address, and identity verification documents — when you register as an investor on this platform. We also collect financial information necessary to process transactions and comply with applicable regulations.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'Your information is used to verify your identity and eligibility as an investor (KYC/AML compliance), process investment transactions, send account notifications and performance reports, and improve the quality of the services we provide. We do not sell your personal information to third parties.',
  },
  {
    title: '3. Data Security',
    body: 'We implement industry-standard security measures including AES-256 encryption at rest and in transit, strict access controls, and continuous monitoring. Your investment data is logically isolated from all other tenants on the underlying infrastructure. No system is completely immune to risk — we encourage you to use strong, unique credentials.',
  },
  {
    title: '4. KYC & Regulatory Compliance',
    body: 'As a regulated investment platform, we are required by law to collect and verify identity information from all investors. This data is processed in accordance with applicable Know Your Customer (KYC) and Anti-Money Laundering (AML) regulations. Failure to provide required information may restrict your access to investment products.',
  },
  {
    title: '5. Data Retention',
    body: 'We retain your personal data for as long as your account is active or as required by applicable law. Financial transaction records are retained for a minimum of 7 years in compliance with regulatory requirements. You may request deletion of non-legally-required data by contacting our Data Protection Officer.',
  },
  {
    title: '6. Your Rights',
    body: 'Depending on your jurisdiction, you have the right to access, correct, restrict, or request deletion of your personal data. To exercise these rights, contact our team at the support address listed below. We will respond within 30 days of receiving a verified request.',
  },
  {
    title: '7. Cookies & Tracking',
    body: 'We use essential session cookies to maintain your login state and platform preferences. We do not use advertising, cross-site tracking, or third-party analytics cookies. You may disable non-essential cookies through your browser settings without affecting core platform functionality.',
  },
  {
    title: '8. Changes to This Policy',
    body: 'We may update this Privacy Policy periodically. Material changes will be communicated to registered investors via email at least 14 days before taking effect. Continued use of the platform after changes constitutes your acceptance of the updated policy.',
  },
  {
    title: '9. Contact Us',
    body: 'For privacy-related inquiries or to exercise your data rights, contact our Data Protection Officer at privacy@cropcapital.com. You may also write to us at the registered business address on file.',
  },
]

function PrivacyPage() {
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
        <div className="bg-primary relative overflow-hidden py-20 lg:py-28 mb-0">
          <div className="absolute inset-0 dot-grid opacity-[0.08]" />
          <div className="premium-container relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-white/20 w-10" />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white/50">
                Legal Document
              </span>
            </div>
            <h1 className="text-display text-[clamp(3rem,6vw,7rem)] text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-base font-bold text-white/45 uppercase tracking-[0.25em]">
              Last updated: March 2026
            </p>
          </div>
        </div>

        <div className="premium-container max-w-4xl mx-auto pt-16">
          <div className="mb-12 p-8 border border-border bg-primary/2.5 flex gap-5">
            <Shield className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <p className="text-lg text-muted-foreground leading-relaxed font-medium">
              {tenant.displayName} is committed to protecting the privacy of all
              investors and their personal data. This policy explains what
              information we collect, how we use it, and your rights regarding
              your data.
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
