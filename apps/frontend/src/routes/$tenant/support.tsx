import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowLeft,
  ChevronRight,
  Mail,
  MessageSquare,
  Phone,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useTenant } from '@/contexts/tenant'

export const Route = createFileRoute('/$tenant/support')({
  component: SupportPage,
})

const faqs = [
  {
    q: 'How do I start investing?',
    a: 'Create an account, complete KYC verification (under 10 minutes), then browse available farm portfolios. Select an opportunity, review the prospectus, and fund your allocation. Your investment is live once payment is confirmed.',
  },
  {
    q: 'When are returns paid out?',
    a: 'Returns are distributed quarterly, following the completion of each harvest cycle and financial reconciliation. Once approved, they are sent directly to your bank account and reflected in your investor dashboard.',
  },
  {
    q: 'Is my capital guaranteed?',
    a: 'No investment in agricultural assets is fully guaranteed. However, all farm portfolios on this platform are covered by comprehensive agricultural insurance policies covering yield loss, weather events, and pest damage. Full risk disclosures are available in our Disclosures document.',
  },
  {
    q: 'How long is each investment cycle?',
    a: 'Investment cycles vary by crop type and region — typically 6 to 18 months. Each portfolio listing clearly states the expected cycle duration, projected returns, and harvest timeline before you commit capital.',
  },
  {
    q: 'Can I withdraw my investment early?',
    a: 'Agricultural investments are illiquid by nature and cannot be redeemed early. Your capital is tied to the crop cycle. We recommend only investing funds you will not need access to for the duration of the stated cycle.',
  },
  {
    q: 'How does KYC verification work?',
    a: 'KYC is completed during account setup. You will be asked to upload a government-issued ID and a selfie. Verification is processed automatically and usually completed in under 15 minutes during business hours.',
  },
  {
    q: 'What fees does the platform charge?',
    a: 'We charge an annual management fee and a performance fee on returns above the stated target. All fees are disclosed in the product documentation before you invest. There are no hidden charges.',
  },
  {
    q: 'How do I report a problem with my account?',
    a: 'Contact our investor support team via the email or phone number listed on this page. For urgent issues affecting active investments, use our priority support channel.',
  },
]

function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const { tenant: tenantParam } = Route.useParams()
  const { tenant } = useTenant()

  const whatsappHref = tenant.supportWhatsapp
    ? `https://wa.me/${tenant.supportWhatsapp.replace(/[^\d]/g, '')}`
    : null

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
        {/* Hero */}
        <div className="bg-primary relative overflow-hidden py-20 lg:py-28 mb-0">
          <div className="absolute inset-0 dot-grid opacity-[0.08]" />
          <div className="premium-container relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-white/20 w-10" />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white/50">
                Investor Support
              </span>
            </div>
            <h1 className="text-display text-[clamp(3rem,6vw,7rem)] text-white mb-4">
              Help Center
            </h1>
            <p className="text-xl text-white/55 font-medium max-w-xl leading-relaxed">
              Find answers to common investor questions or get in touch with the{' '}
              {tenant.displayName} support team.
            </p>
          </div>
        </div>

        <div className="premium-container pt-16">
          {/* Contact cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border mb-24">
            {[
              {
                icon: Mail,
                title: 'Email Support',
                desc: 'For account issues, KYC queries, and investment questions.',
                action: tenant.supportEmail || 'support@cropcapital.com',
                href: `mailto:${tenant.supportEmail || 'support@cropcapital.com'}`,
              },
              {
                icon: Phone,
                title: 'Phone Support',
                desc: 'Speak directly with an investor relations representative.',
                action: tenant.supportPhone || 'See contact page',
                href: tenant.supportPhone ? `tel:${tenant.supportPhone}` : '#',
              },
              {
                icon: whatsappHref ? MessageSquare : Zap,
                title: whatsappHref ? 'WhatsApp Support' : 'Priority Support',
                desc: whatsappHref
                  ? 'Chat with our team directly on WhatsApp during business hours.'
                  : 'For urgent issues affecting active investments or payouts.',
                action: whatsappHref ? 'Start Chat' : 'Contact Support',
                href:
                  whatsappHref ||
                  `mailto:${tenant.supportEmail || 'support@cropcapital.com'}`,
              },
            ].map((card, i) => {
              const Icon = card.icon
              return (
                <div
                  key={i}
                  className="bg-background p-10 lg:p-12 group hover:bg-primary/2.5 transition-colors duration-300"
                >
                  <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-foreground mb-3 uppercase tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-base text-muted-foreground mb-8 leading-relaxed font-medium">
                    {card.desc}
                  </p>
                  <a
                    href={card.href}
                    className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-primary hover:text-primary/70 transition-colors"
                  >
                    {card.action} <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              )
            })}
          </div>

          {/* FAQ */}
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-px bg-primary w-10" />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">
                Common Questions
              </span>
            </div>
            <h2 className="text-display text-[clamp(2rem,4vw,4.5rem)] text-foreground mb-12">
              Frequently Asked{' '}
              <span className="italic-serif text-primary">Questions.</span>
            </h2>

            <div className="space-y-0 border border-border">
              {faqs.map((faq, i) => (
                <div key={i} className="border-b border-border last:border-b-0">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-start justify-between gap-8 p-8 text-left group hover:bg-primary/2.5 transition-colors duration-200 cursor-pointer"
                  >
                    <span className="text-base font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">
                      {faq.q}
                    </span>
                    <ChevronRight
                      className={`w-5 h-5 text-primary shrink-0 mt-0.5 transition-transform duration-300 ${openFaq === i ? 'rotate-90' : ''}`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-8 pb-8">
                      <p className="text-base text-muted-foreground leading-relaxed font-medium">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact callout */}
          <div className="mt-24 bg-muted/40 border border-border p-12 lg:p-16 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px bg-primary w-8" />
                <span className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">
                  Still need help?
                </span>
              </div>
              <h3 className="text-display text-[clamp(1.8rem,3vw,3rem)] text-foreground mb-3">
                Talk to our{' '}
                <span className="italic-serif text-primary">team.</span>
              </h3>
              <p className="text-base text-muted-foreground font-medium max-w-md">
                Our investor success team is available Monday–Friday, 8am–6pm.
                Average response time is under 4 hours.
              </p>
            </div>
            <a
              href={`mailto:${tenant.supportEmail || 'support@cropcapital.com'}`}
            >
              <Button
                size="lg"
                className="btn-primary-gradient h-14 px-12 text-sm font-black uppercase tracking-[0.18em] whitespace-nowrap"
              >
                Email Support <Mail className="w-5 h-5 ml-3 inline" />
              </Button>
            </a>
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
