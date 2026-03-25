import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, Shield } from 'lucide-react'

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
})

const sections = [
  {
    title: '1. Information We Collect',
    body: 'CropCapital collects personal information you provide directly — including name, email address, business details, and payment information — when you register as an operator or partner on our platform. We also collect usage data, log files, and device information automatically when you interact with the platform.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'We use collected information to operate and maintain the CropCapital platform, process transactions, communicate about your account, comply with legal obligations (including KYC/AML requirements), and improve our services. We do not sell your personal information to third parties.',
  },
  {
    title: '3. Data Isolation & Tenant Privacy',
    body: 'Each operator tenant on the CropCapital platform is logically isolated. Your tenant data, user records, and configuration are never shared with or accessible by other operators. Our multi-tenant architecture enforces strict data boundaries at every layer.',
  },
  {
    title: '4. Data Security',
    body: 'We implement industry-standard security measures including AES-256 encryption at rest and in transit, access controls, regular penetration testing, and continuous monitoring. However, no system is completely secure — we encourage you to use strong, unique credentials.',
  },
  {
    title: '5. Data Retention',
    body: 'We retain your personal information for as long as your account is active or as needed to provide services. You may request deletion of your data subject to any legal obligations we have to retain certain records (typically 7 years for financial records).',
  },
  {
    title: '6. Your Rights',
    body: 'Depending on your jurisdiction, you may have rights to access, correct, delete, or restrict processing of your personal data. To exercise these rights, contact us at privacy@cropcapital.com. We will respond within 30 days.',
  },
  {
    title: '7. Cookies',
    body: 'We use essential cookies to maintain your session and preferences. We do not use advertising or tracking cookies. You can disable cookies in your browser, though this may affect platform functionality.',
  },
  {
    title: '8. Changes to This Policy',
    body: 'We may update this Privacy Policy periodically. We will notify registered operators of material changes via email. Continued use of the platform after changes constitutes acceptance of the updated policy.',
  },
  {
    title: '9. Contact Us',
    body: 'For privacy-related inquiries, contact our Data Protection Officer at privacy@cropcapital.com or write to CropCapital Global Infrastructure, [Address].',
  },
]

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Minimal nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-2xl border-b border-border py-5 px-8">
        <div className="premium-container flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[11px] font-black uppercase tracking-[0.35em]">
              Back to Platform
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black text-xs">
                CC
              </span>
            </div>
            <span className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
              CropCapital
            </span>
          </div>
        </div>
      </nav>

      <div className="pt-28 pb-32">
        {/* Header */}
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

        {/* Content */}
        <div className="premium-container max-w-4xl mx-auto pt-16">
          <div className="mb-12 p-8 border border-border bg-primary/2.5 flex gap-5">
            <Shield className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <p className="text-lg text-muted-foreground leading-relaxed font-medium">
              CropCapital is committed to protecting the privacy of all platform
              operators and their end users. This policy explains what
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
              © {new Date().getFullYear()} CropCapital Global Infrastructure
            </p>
            <div className="flex gap-8">
              <a
                href="/terms"
                className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="/support"
                className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors"
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
