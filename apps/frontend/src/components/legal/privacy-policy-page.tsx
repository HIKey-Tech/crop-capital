import { Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  ChevronRight,
  CircleCheckBig,
  Mail,
  MapPin,
  Phone,
  Shield,
} from 'lucide-react'

type LegalSection = {
  id: string
  title: string
  intro?: string
  paragraphs?: Array<string>
  bullets?: Array<string>
}

type FooterLink = {
  label: string
  href?: string
  to?: string
  params?: Record<string, string>
}

type PrivacyPolicyPageProps = {
  brandName: string
  shortName: string
  legalName: string
  effectiveDate: string
  summary: string
  sections: Array<LegalSection>
  backLabel: string
  backTo?: string
  backHref?: string
  backParams?: Record<string, string>
  supportEmail: string
  supportPhone?: string
  address?: string
  footerLinks: Array<FooterLink>
}

const highlights = [
  'Account, identity, payment, farm, communications, and device data',
  'Used for platform operations, KYC or AML compliance, support, billing, and product improvement',
  'Shared only with processors, partners, legal authorities, or transaction participants when necessary',
  'Supports access, correction, deletion, portability, objection, and consent withdrawal where applicable',
]

function PageLink({
  href,
  to,
  params,
  className,
  children,
}: {
  href?: string
  to?: string
  params?: Record<string, string>
  className: string
  children: React.ReactNode
}) {
  if (to) {
    return (
      <Link to={to} params={params} className={className}>
        {children}
      </Link>
    )
  }

  return (
    <a href={href} className={className}>
      {children}
    </a>
  )
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode
  label: string
  value: string
  href?: string
}) {
  return (
    <div className="rounded-3xl border border-border/80 bg-background/85 px-5 py-4 shadow-(--shadow-card) backdrop-blur-sm">
      <p className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </p>
      {href ? (
        <a
          href={href}
          className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm font-semibold text-foreground">{value}</p>
      )}
    </div>
  )
}

export function PrivacyPolicyPage({
  brandName,
  shortName,
  legalName,
  effectiveDate,
  summary,
  sections,
  backLabel,
  backTo,
  backHref,
  backParams,
  supportEmail,
  supportPhone,
  address,
  footerLinks,
}: PrivacyPolicyPageProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.12),transparent_32%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(40_16%_97%)_100%)] text-foreground selection:bg-primary selection:text-primary-foreground">
      <nav className="sticky top-0 z-50 border-b border-border/80 bg-background/88 px-5 py-4 backdrop-blur-2xl sm:px-8">
        <div className="premium-container flex items-center justify-between gap-4">
          <PageLink
            to={backTo}
            href={backHref}
            params={backParams}
            className="group inline-flex items-center gap-3 text-sm font-bold text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="uppercase tracking-[0.3em] text-[11px]">
              {backLabel}
            </span>
          </PageLink>

          <div className="flex items-center gap-3 rounded-full border border-border/80 bg-card/85 px-3 py-2 shadow-(--shadow-card) backdrop-blur-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-black text-primary-foreground">
              {shortName}
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">
                Privacy & Data Use
              </p>
              <p className="text-sm font-bold text-foreground">{brandName}</p>
            </div>
          </div>
        </div>
      </nav>

      <header className="relative overflow-hidden border-b border-border/70">
        <div className="absolute inset-0 dot-grid opacity-[0.08]" />
        <div className="absolute left-[8%] top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-[10%] top-24 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />

        <div className="premium-container relative grid gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] lg:items-end lg:py-24">
          <div className="max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-primary/15 bg-primary/8 px-4 py-2 text-[11px] font-black uppercase tracking-[0.34em] text-primary">
              <Shield className="h-4 w-4" />
              Legal Document
            </div>

            <h1 className="text-display text-[clamp(3rem,6vw,6.6rem)] leading-[0.95] text-primary">
              Privacy Policy
            </h1>

            <p className="mt-5 max-w-3xl text-lg font-medium leading-8 text-foreground/80 sm:text-xl">
              {summary}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-full border border-border/80 bg-card/90 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground shadow-(--shadow-card)">
                Effective Date: {effectiveDate}
              </div>
              <div className="rounded-full border border-border/80 bg-card/90 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground shadow-(--shadow-card)">
                Global Platform Coverage
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border/70 bg-card/88 p-6 shadow-(--shadow-premium) backdrop-blur-xl">
            <p className="mb-4 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              At A Glance
            </p>
            <div className="space-y-4">
              {highlights.map((highlight) => (
                <div key={highlight} className="flex gap-3">
                  <CircleCheckBig className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm font-medium leading-6 text-foreground/78">
                    {highlight}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="premium-container grid gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <section className="space-y-6">
          {sections.map((section, index) => (
            <article
              key={section.id}
              id={section.id}
              className="scroll-mt-28 rounded-3xl border border-border/75 bg-card/92 p-6 shadow-(--shadow-card) backdrop-blur-sm sm:p-8"
            >
              <div className="mb-6 flex flex-wrap items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-black text-primary-foreground">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  {section.title}
                </h2>
              </div>

              {section.intro ? (
                <p className="mb-5 text-base font-semibold leading-7 text-foreground/82 sm:text-lg">
                  {section.intro}
                </p>
              ) : null}

              {section.paragraphs?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mb-4 text-base leading-8 text-muted-foreground last:mb-0"
                >
                  {paragraph}
                </p>
              ))}

              {section.bullets?.length ? (
                <div className="mt-6 grid gap-3">
                  {section.bullets.map((bullet) => (
                    <div
                      key={bullet}
                      className="flex gap-3 rounded-2xl border border-border/70 bg-muted/35 px-4 py-3"
                    >
                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <p className="text-sm leading-6 text-foreground/78 sm:text-[15px]">
                        {bullet}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </section>

        <aside className="space-y-6 lg:sticky lg:top-24">
          <div className="rounded-3xl border border-border/75 bg-card/92 p-6 shadow-(--shadow-card) backdrop-blur-sm">
            <p className="mb-5 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              Quick Navigation
            </p>
            <div className="space-y-2">
              {sections.map((section, index) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-start gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-foreground/78 transition-colors hover:bg-primary/8 hover:text-primary"
                >
                  <span className="font-black text-primary/80">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>{section.title}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border/75 bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--primary)/0.06))] p-6 shadow-(--shadow-card)">
            <p className="mb-5 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              Contact
            </p>
            <div className="space-y-4">
              <ContactRow
                icon={<Mail className="h-4 w-4" />}
                label="Privacy Requests"
                value={supportEmail}
                href={`mailto:${supportEmail}`}
              />
              {supportPhone ? (
                <ContactRow
                  icon={<Phone className="h-4 w-4" />}
                  label="Phone"
                  value={supportPhone}
                  href={`tel:${supportPhone.replace(/\s+/g, '')}`}
                />
              ) : null}
              {address ? (
                <ContactRow
                  icon={<MapPin className="h-4 w-4" />}
                  label="Mailing Address"
                  value={address}
                />
              ) : null}
            </div>
          </div>
        </aside>
      </main>

      <footer className="border-t border-border/75 bg-card/60">
        <div className="premium-container flex flex-col gap-6 px-5 py-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.32em] text-muted-foreground">
              Privacy Commitment
            </p>
            <p className="mt-2 text-sm font-medium text-foreground/72">
              © {new Date().getFullYear()} {legalName}. All rights reserved.
            </p>
          </div>

          <div className="flex flex-wrap gap-6">
            {footerLinks.map((link) => (
              <PageLink
                key={link.label}
                href={link.href}
                to={link.to}
                params={link.params}
                className="text-[11px] font-black uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </PageLink>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

export const cropCapitalPrivacyPolicySections: Array<LegalSection> = [
  {
    id: 'introduction',
    title: 'Introduction & Scope',
    paragraphs: [
      'CropCapital provides an agricultural real estate platform at cropcapital.com together with related mobile and API services. This Privacy Policy explains what personal and non-personal information we collect, why we collect it, how we use it, how we share it, the legal bases for processing, your rights, and how we protect information.',
      'The policy applies to users, tenants, landowners, investors, service providers, visitors, and others who access or use the platform. By accessing or using the platform or providing personal information to CropCapital, you accept this Privacy Policy. If you do not agree, you should not use the platform.',
    ],
  },
  {
    id: 'information-we-collect',
    title: 'Information We Collect',
    intro:
      'We collect information directly from you, automatically from your use of the platform, and from trusted third parties and integrations.',
    bullets: [
      'Account data such as name, email, phone number, password, profile photo, address, organization, and role.',
      'Identity verification records including government ID, business registration, tax ID, passport, photograph, and KYC or AML support documents.',
      'Financial and payment information including payment card details, bank account or ACH data, billing address, tax forms, and investor accreditation status.',
      'Property and agricultural data including land parcel details, cadastral IDs, crop types, field boundaries, yields, planting and harvest schedules, inputs, equipment, lease terms, tenancy agreements, and insurance information.',
      'Business operations data such as crop plans, supply-chain contacts, vendor details, sales information, and contract information.',
      'Communications, support requests, notes, messages, marketing preferences, and consent choices.',
      'Usage, device, and technical data including IP address, device type, browser, operating system, device identifiers, screen resolution, crash logs, page views, feature usage, timestamps, clicks, session duration, and approximate location from IP.',
      'Information from payment processors, identity-verification providers, mapping and satellite providers, farm sensors or IoT integrations, social platforms, CRMs, business partners, public records, and data brokers where permitted.',
      'Aggregated, de-identified, or anonymized datasets created for analytics, benchmarking, research, and product improvement.',
    ],
  },
  {
    id: 'purposes-and-legal-bases',
    title: 'Purposes Of Processing & Legal Bases',
    paragraphs: [
      'We process information to provide, operate, secure, and maintain the platform; register and manage accounts, subscriptions, tenancy workflows, payments, and billing; verify identity; support KYC and AML compliance; prevent fraud; provide farming, analytics, marketplace, marketing, investment, and sales functionality; communicate with you; personalize experiences; send marketing where permitted; improve the product; and comply with laws, legal process, and accounting obligations.',
      'Depending on the activity and jurisdiction, our legal bases include performance of a contract, compliance with legal obligations, legitimate interests, and consent where required. You can withdraw consent where processing depends on consent, subject to lawful exceptions.',
    ],
  },
  {
    id: 'cookies-and-tracking',
    title: 'Cookies & Tracking Technologies',
    paragraphs: [
      'We use cookies, web beacons, pixel tags, local storage, and similar technologies to operate the platform, secure accounts, analyze usage, remember preferences, and where permitted show relevant content and measure campaigns.',
    ],
    bullets: [
      'Strictly necessary cookies for core platform functionality and authentication.',
      'Performance and analytics cookies for usage analysis and product improvement.',
      'Functional cookies for saved settings and preferences.',
      'Advertising or targeting cookies for personalized ads and campaign measurement where applicable.',
      'You can control cookies through browser settings and available opt-out tools, but disabling cookies may affect platform functionality.',
    ],
  },
  {
    id: 'sharing-and-disclosure',
    title: 'Sharing & Disclosure',
    paragraphs: [
      'We may share personal information with service providers and processors that help us deliver payments, hosting, identity verification, analytics, CRM, communications, mapping, legal, and accounting services. We may also share data with affiliates and subsidiaries for group operations, with marketplace participants when you list property or use public features, with investors, buyers, or partners during transactions, and with law enforcement, regulators, or courts when required by law or necessary to protect rights and safety.',
      'We also share aggregated or anonymized data for research and benchmarking. We require processors to use data only for specified purposes under written agreements. We do not sell personal data for monetary consideration, though some laws may define sale or sharing more broadly and grant opt-out rights.',
    ],
  },
  {
    id: 'international-transfers-retention-security',
    title: 'International Transfers, Retention & Security',
    paragraphs: [
      'CropCapital operates globally, so personal information may be transferred to, processed in, and stored in countries other than your own. We use appropriate safeguards such as standard contractual clauses, approved transfer mechanisms, binding corporate rules, or other lawful tools where required.',
      'We retain data as long as needed to provide services, comply with legal obligations, resolve disputes, enforce agreements, satisfy accounting and recordkeeping duties, or as otherwise permitted by law. Transactional and financial records are generally retained for seven years or as local tax laws require, while identity-verification records may be retained in line with AML rules.',
      'We implement technical, administrative, and organizational safeguards including encryption in transit, access controls, logging, secure development practices, vulnerability management, and incident response. No system is perfectly secure, but we will follow applicable breach-notification laws if an incident affects personal data.',
    ],
  },
  {
    id: 'rights-and-choices',
    title: 'Your Rights & Choices',
    intro:
      'Depending on your region, you may have privacy rights under laws such as the GDPR, CCPA or CPRA, LGPD, the UK data protection framework, or other local laws.',
    bullets: [
      'Access the personal data we hold about you.',
      'Correct inaccurate or incomplete information.',
      'Request deletion where erasure is lawful.',
      'Restrict or object to certain processing, including direct marketing.',
      'Receive your data in a structured, machine-readable format where portability applies.',
      'Withdraw consent where processing depends on consent.',
      'Request human review of significant automated decision-making where local law provides that right.',
      'Exercise rights through account settings for basic changes or by emailing privacy@cropcapital.com with sufficient details and proof of identity.',
    ],
  },
  {
    id: 'marketing-automated-decisions-and-children',
    title: 'Marketing, Profiling & Children',
    paragraphs: [
      'We send marketing communications only with consent where required or under legitimate interests where permitted. You can opt out using unsubscribe links, SMS STOP replies, or account settings. Transactional and service messages are not affected by marketing opt-outs.',
      'We may use automated systems for analytics, recommendations, risk scoring, and personalized content. Where decisions produce legal or similarly significant effects, you may have rights to explanation or human review depending on the law that applies to you.',
      'The platform is not intended for children under 16, or a higher age where local law requires it. If we learn that information from a child was collected without proper consent, we will delete it.',
    ],
  },
  {
    id: 'third-parties-and-industry-notes',
    title: 'Third-Party Services & Industry Notes',
    paragraphs: [
      'The platform may contain third-party widgets, content, integrations, and links. Those services operate under their own privacy practices, and we recommend reviewing their policies directly.',
    ],
    bullets: [
      'Agricultural and farm data, including crop, yield, field-boundary, and sensor data, may be sensitive for business operations. We treat it as business-critical and disclose it only where necessary, authorized, legally required, or intentionally made public in marketplace listings.',
      'Information you choose to make public in marketplace listings, such as property descriptions, parcel locations, and photos, will be visible according to your listing settings.',
      'If you connect IoT devices, farm sensors, or equipment integrations, the resulting device data is collected and handled under this policy and any device-specific agreement.',
      'We apply data minimization and purpose limitation principles, use processor contracts and confidentiality obligations, and seek contractual remedies for processor breaches where appropriate.',
    ],
  },
  {
    id: 'changes-breach-and-contact',
    title: 'Policy Changes, Breach Notices & Contact',
    paragraphs: [
      'We may update this Privacy Policy to reflect changes in law, products, or business practices. When required, we will post the revised policy with a new effective date and provide additional notice by email or platform message. Continued use after notice constitutes acceptance where permitted by law.',
      'If a personal-data breach affects your information, we will notify you and regulators as required, including the nature of the breach, the data involved, the actions taken, and recommended next steps where applicable.',
      'For privacy inquiries, complaints, or rights requests, contact privacy@cropcapital.com. CropCapital headquarters is located at TheCans Park, IBB Boulevard, Maitama, Abuja, and the listed phone line is +23409132508804.',
    ],
  },
]
