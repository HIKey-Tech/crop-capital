import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, ChevronRight, Mail, MessageSquare, Zap } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/support')({
  component: SupportPage,
})

const faqs = [
  {
    q: 'How do I provision a new tenant?',
    a: 'Navigate to your Super Admin dashboard and select "New Tenant". Fill in the required brand details, domain, and subscription tier. Provisioning completes in under 5 minutes.',
  },
  {
    q: 'Can I assign a custom domain to a tenant?',
    a: 'Yes. Each tenant can have a dedicated custom domain. Configure the domain in the tenant settings and update your DNS records to point to the CropCapital infrastructure. Propagation typically takes 15–60 minutes.',
  },
  {
    q: 'How does the subscription tier system work?',
    a: 'Each tenant is assigned a subscription tier that controls which features are enabled — such as KYC, investor returns tracking, and advanced analytics. Tiers can be upgraded or downgraded from the operator console without redeployment.',
  },
  {
    q: 'What does RBAC governance cover?',
    a: 'Role-Based Access Control (RBAC) allows you to assign granular permissions to users across tenants. Roles include Platform Operator, Tenant Admin, Investor, and Read-Only Auditor. Users can be mapped to multiple tenants with different roles per tenant.',
  },
  {
    q: 'Is there a staging environment available?',
    a: 'Yes. All operator accounts include access to a staging environment that mirrors production. We strongly recommend testing all configuration changes in staging before promoting to live tenants.',
  },
  {
    q: 'How do I export tenant data?',
    a: 'Data exports are available from the tenant management panel in CSV and JSON formats. For large datasets or automated exports, use the CropCapital API with appropriate authorization credentials.',
  },
  {
    q: 'What are the SLA terms for uptime?',
    a: 'The platform maintains a 99.9% uptime SLA. Scheduled maintenance windows are communicated via email and status page at least 48 hours in advance. Emergency maintenance may occur with less notice in critical security situations.',
  },
  {
    q: 'How do I report a security vulnerability?',
    a: 'Security vulnerabilities should be reported directly to security@cropcapital.com. Please do not disclose vulnerabilities publicly until we have had 90 days to investigate and remediate. We have a responsible disclosure program.',
  },
]

function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
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
        {/* Hero */}
        <div className="bg-primary relative overflow-hidden py-20 lg:py-28 mb-0">
          <div className="absolute inset-0 dot-grid opacity-[0.08]" />
          <div className="premium-container relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-white/20 w-10" />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white/50">
                Operator Support
              </span>
            </div>
            <h1 className="text-display text-[clamp(3rem,6vw,7rem)] text-white mb-4">
              Help Center
            </h1>
            <p className="text-xl text-white/55 font-medium max-w-xl leading-relaxed">
              Find answers to common questions or get in touch with our operator
              support team.
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
                desc: 'For technical issues, billing, and account management.',
                action: 'support@cropcapital.com',
                href: 'mailto:support@cropcapital.com',
              },
              {
                icon: MessageSquare,
                title: 'Platform Chat',
                desc: 'Available in-app for authenticated operators during business hours.',
                action: 'Open Platform',
                href: '/auth',
              },
              {
                icon: Zap,
                title: 'Emergency Line',
                desc: 'For critical production incidents affecting live tenants.',
                action: 'urgent@cropcapital.com',
                href: 'mailto:urgent@cropcapital.com',
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

          {/* Contact form callout */}
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
                Our operator success team is available Monday–Friday, 8am–6pm
                WAT. Average response time is under 4 hours.
              </p>
            </div>
            <a href="mailto:support@cropcapital.com">
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
              © {new Date().getFullYear()} CropCapital Global Infrastructure
            </p>
            <div className="flex gap-8">
              <a
                href="/privacy"
                className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
