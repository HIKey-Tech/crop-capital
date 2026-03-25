import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Eye,
  FileCheck,
  Lock,
  Menu,
  Server,
  Settings2,
  ShieldCheck,
  X,
  Zap,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/fade-in'
import { useInView } from '@/hooks/use-in-view'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/')({
  component: RootRoute,
})

// --- Animated topo contour lines ---
function TopoBackground() {
  const lines = [
    {
      d: 'M-200 90 C 100 60,300 120,600 90 S 900 60,1200 90 S 1500 120,1800 90',
      delay: 0,
    },
    {
      d: 'M-200 190 C 100 160,300 220,600 190 S 900 160,1200 190 S 1500 220,1800 190',
      delay: 0.6,
    },
    {
      d: 'M-200 290 C 100 260,300 320,600 290 S 900 260,1200 290 S 1500 320,1800 290',
      delay: 1.2,
    },
    {
      d: 'M-200 390 C 100 360,300 420,600 390 S 900 360,1200 390 S 1500 420,1800 390',
      delay: 1.8,
    },
    {
      d: 'M-200 490 C 100 460,300 520,600 490 S 900 460,1200 490 S 1500 520,1800 490',
      delay: 2.4,
    },
    {
      d: 'M-200 590 C 100 560,300 620,600 590 S 900 560,1200 590 S 1500 620,1800 590',
      delay: 3.0,
    },
    {
      d: 'M-200 690 C 100 660,300 720,600 690 S 900 660,1200 690 S 1500 720,1800 690',
      delay: 3.6,
    },
  ]
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1440 800"
      preserveAspectRatio="xMidYMid slice"
    >
      {lines.map((c, i) => (
        <path
          key={i}
          d={c.d}
          fill="none"
          stroke="hsl(154 50% 18%)"
          strokeWidth="1"
          style={{
            strokeDasharray: 3200,
            strokeDashoffset: 3200,
            opacity: 0,
            animation: `topoTrace 4s cubic-bezier(0.19, 1, 0.22, 1) ${c.delay}s forwards`,
          }}
        />
      ))}
    </svg>
  )
}

// --- Animated counter ---
function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
}: {
  value: number
  suffix?: string
  prefix?: string
}) {
  const [count, setCount] = useState(0)
  const { ref, isInView } = useInView({ once: true })
  useEffect(() => {
    if (!isInView) return
    let start = 0
    const timer = setInterval(() => {
      start += Math.ceil(value / 50)
      if (start >= value) {
        setCount(value)
        clearInterval(timer)
      } else setCount(start)
    }, 30)
    return () => clearInterval(timer)
  }, [isInView, value])
  return (
    <span ref={ref as any}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

// --- Navbar ---
function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#process' },
    { name: 'Security', href: '#security' },
    { name: 'Support', href: 'mailto:support@cropcapital.com' },
  ]

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-8 py-7',
        isScrolled
          ? 'bg-background/95 backdrop-blur-2xl border-b border-border py-5 shadow-sm'
          : 'bg-transparent',
      )}
    >
      <div className="premium-container flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-primary flex items-center justify-center transition-all duration-300 group-hover:scale-105">
            <span className="text-primary-foreground font-black text-sm tracking-tighter">
              CC
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black uppercase tracking-[0.22em] text-foreground leading-none">
              CropCapital
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.35em] text-primary/70 leading-none mt-0.5">
              Platform
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-[11px] font-bold uppercase tracking-[0.35em] text-muted-foreground hover:text-primary transition-colors relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-primary group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link to="/auth" className="hidden sm:block">
            <Button variant="ghost" className="font-bold text-sm px-6 h-10">
              Sign In
            </Button>
          </Link>
          <Link to="/auth">
            <Button className="btn-primary-gradient px-8 h-11 text-xs uppercase tracking-[0.18em] font-black">
              Access Platform <ArrowRight className="w-4 h-4 ml-2 inline" />
            </Button>
          </Link>
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu className="w-6 h-6 text-foreground" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'fixed inset-0 z-60 bg-background backdrop-blur-2xl transition-all duration-700 md:hidden',
          isMobileOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex flex-col h-full p-8 sm:p-12">
          <div className="flex items-center justify-between mb-10 sm:mb-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-black text-sm">
                  CC
                </span>
              </div>
              <span className="font-black uppercase tracking-[0.22em] text-lg">
                CropCapital
              </span>
            </div>
            <button onClick={() => setIsMobileOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-4xl text-display text-foreground hover:text-primary transition-colors py-3 border-b border-border"
                onClick={() => setIsMobileOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="mt-10">
              <Link to="/auth" onClick={() => setIsMobileOpen(false)}>
                <Button className="btn-primary-gradient w-full h-14 font-black uppercase tracking-widest text-sm">
                  Platform Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

// --- Hero Section ---
function HeroSection() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [])

  const pillarItems = [
    { label: 'Multi-Tenant', sub: 'Native Architecture', href: '#features' },
    { label: 'Role-Based', sub: 'Granular Access Control', href: '#features' },
    { label: 'Config-First', sub: 'Rapid Deployment', href: '#process' },
    {
      label: 'Bank-Grade',
      sub: 'Secure Core Infrastructure',
      href: '#security',
    },
  ]

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden dot-grid pt-20">
      <TopoBackground />
      <div className="absolute top-0 right-0 w-60px] h-60px] bg-primary/6 rounded-full blur-[200px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 size-100 bg-primary/4 rounded-full blur-[160px] pointer-events-none" />

      <div className="premium-container relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-16 lg:py-24">
          {/* Left: main content */}
          <div className="lg:col-span-7">
            <div
              className="flex items-center gap-4 mb-6"
              style={{
                opacity: mounted ? 1 : 0,
                transition: 'opacity 0.8s ease 100ms',
              }}
            >
              <div
                className="h-px bg-primary/40"
                style={{
                  width: mounted ? '44px' : '0px',
                  transition: 'width 1.2s cubic-bezier(0.19,1,0.22,1) 400ms',
                }}
              />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">
                Tenant Launch Infrastructure
              </span>
            </div>

            <h1 className="mb-7">
              {['Scale Your', 'Agri-Finance', 'Network.'].map((word, i) => (
                <span key={i} className="block mb-[-0.06em]">
                  <span
                    className={cn(
                      'block text-display text-[clamp(2.6rem,6vw,6.5rem)]',
                      i === 1 ? 'italic-serif text-primary' : 'text-foreground',
                    )}
                    style={{
                      animation: mounted
                        ? `slideRevealY 1.1s cubic-bezier(0.19,1,0.22,1) ${300 + i * 200}ms both`
                        : 'none',
                    }}
                  >
                    {word}
                  </span>
                </span>
              ))}
            </h1>

            <div
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'none' : 'translateY(16px)',
                transition: 'opacity 0.9s ease 1s, transform 0.9s ease 1s',
              }}
            >
              <p className="text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed font-medium">
                Professional-grade infrastructure to onboard, configure, and
                operate multiple agricultural investment brands — with absolute
                confidence.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                <Link to="/auth">
                  <Button
                    size="lg"
                    className="btn-primary-gradient h-14 px-12 text-sm font-black uppercase tracking-[0.18em] group"
                  >
                    Platform Access
                    <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <a
                  href="mailto:support@cropcapital.com"
                  className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors group"
                >
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  Request Partner Access
                </a>
              </div>
            </div>
          </div>

          {/* Right: stat pillar — each item links to a section */}
          <div
            className="lg:col-span-5 flex flex-col border-t lg:border-t-0 border-border pt-8 lg:pt-0"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'none' : 'translateX(24px)',
              transition: 'opacity 1s ease 1.1s, transform 1s ease 1.1s',
            }}
          >
            {pillarItems.map((stat, i) => (
              <a
                key={i}
                href={stat.href}
                className={cn(
                  'group flex items-center justify-between py-5 border-b border-border transition-all duration-300 hover:pl-3',
                  i === 0 && 'border-t',
                )}
              >
                <div>
                  <div className="text-xl font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
                    {stat.label}
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground mt-0.5">
                    {stat.sub}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
              </a>
            ))}

            <div className="mt-8 flex items-center gap-4 text-muted-foreground/50">
              <div className="flex -space-x-2">
                {['#1a4d2e', '#0f3320', '#2d6b45', '#0a2417'].map((c, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-white text-[10px] font-black"
                    style={{ backgroundColor: c }}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.22em]">
                10+ operators deployed
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// --- Platform Stats Bar ---
function StatsBar() {
  const stats = [
    { value: 99, suffix: '.9%', label: 'Platform Uptime' },
    { value: 5, suffix: ' min', label: 'Tenant Deploy Time' },
    { value: 10, suffix: '+', label: 'Live Operators' },
    { value: 0, suffix: ' Breaches', label: 'Security Record' },
  ]
  return (
    <section className="bg-secondary text-secondary-foreground relative overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-5" />
      <div className="premium-container relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={cn(
                'py-10 lg:py-20 px-6 sm:px-8 lg:px-12 border-r border-white/10 last:border-r-0',
                i < 2 && 'border-b lg:border-b-0',
              )}
            >
              <FadeIn delay={i * 120}>
                <div className="text-[clamp(2.5rem,5vw,4rem)] font-black text-primary-foreground leading-none mb-2 tracking-tight">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-secondary-foreground/45 mt-1">
                  {stat.label}
                </div>
              </FadeIn>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- Features Section ---
function FeaturesSection() {
  const features = [
    {
      icon: Building2,
      label: 'Tenant Architecture',
      title: 'Lifecycle Management',
      body: 'Provision new investment brands in minutes. Map dedicated domains, configure unique slugs, and maintain full governance over activation states.',
      bullets: [
        'Automated Domain Routing',
        'Custom Brand Isolation',
        'Subscription Tier Engine',
      ],
    },
    {
      icon: Settings2,
      label: 'Configuration Engine',
      title: 'Granular Feature Flags',
      body: 'Deploy updates per tenant without touching code. Toggle KYC validation, Wallet services, or Advanced Analytics instantly.',
      bullets: [
        'Hot-Swappable Modules',
        'Dynamic Configuration',
        'A/B Deployment Engine',
      ],
      featured: true,
    },
    {
      icon: ShieldCheck,
      label: 'Access Control',
      title: 'Global RBAC Governance',
      body: 'Secure cross-tenant user mapping. Assign precise roles to investors, local admins, and platform overseers with bulletproof isolation.',
      bullets: [
        'Zero-Trust Isolation',
        'Cross-Tenant Identity',
        'Full Activity Auditing',
      ],
    },
  ]
  return (
    <section id="features" className="section-spacing relative">
      <div className="premium-container relative z-10">
        <FadeIn className="mb-20 lg:mb-28">
          <div className="flex items-center gap-4 mb-6">
            <div
              className="h-px bg-primary w-10 origin-left"
              style={{ animation: 'lineGrowX 1s ease forwards' }}
            />
            <span className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">
              Operator Toolkit
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-end">
            <h2 className="text-display text-[clamp(2.8rem,5.5vw,6.5rem)] text-foreground">
              The Complete
              <br />
              <span className="italic-serif text-primary">Command Suite.</span>
            </h2>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-lg leading-relaxed font-medium">
              Centralized control for high-performance networks. Launch multiple
              investment sub-brands from a single unified source of truth.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 border border-border">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <FadeIn key={i} delay={i * 150} direction="up">
                <div
                  className={cn(
                    'feature-card p-8 md:p-10 lg:p-14 h-full flex flex-col bg-background',
                    i < 2 && 'border-b md:border-b-0 md:border-r border-border',
                    feature.featured && 'bg-primary/2.5',
                  )}
                >
                  <div
                    className={cn(
                      'h-px mb-10 origin-left',
                      feature.featured ? 'bg-primary' : 'bg-border',
                    )}
                    style={{
                      animation:
                        'lineGrowX 1.4s cubic-bezier(0.19,1,0.22,1) forwards',
                    }}
                  />

                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.45em] text-muted-foreground">
                      {feature.label}
                    </span>
                  </div>

                  <h3 className="text-display text-[clamp(1.8rem,3vw,2.5rem)] text-foreground mb-5">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-10 flex-1 font-medium">
                    {feature.body}
                  </p>

                  <ul className="space-y-3 mt-auto">
                    {feature.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-center gap-3 text-base font-bold text-foreground group/item"
                      >
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 transition-all duration-300 group-hover/item:bg-primary group-hover/item:text-primary-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// --- Process Section ---
function ProcessSection() {
  const steps = [
    {
      number: '01',
      title: 'Create Tenant Profile',
      desc: 'Define a unique slug, display name, legal entity, and custom domain. Your brand infrastructure, your rules.',
    },
    {
      number: '02',
      title: 'Assign Subscription Tier',
      desc: 'Select from configured tiers to unlock specific modules — KYC, Wallet, Analytics — with zero code changes.',
    },
    {
      number: '03',
      title: 'Configure Users & Roles',
      desc: 'Map users across tenant boundaries with granular RBAC. Investors, admins, and overseers perfectly isolated.',
    },
    {
      number: '04',
      title: 'Deploy in Under 5 Minutes',
      desc: 'Activate and go live. Your tenant is fully provisioned and accessible on its dedicated domain immediately.',
    },
  ]
  return (
    <section
      id="process"
      className="section-spacing bg-muted/30 border-y border-border relative overflow-hidden"
    >
      <div className="absolute inset-0 dot-grid opacity-60" />
      <div className="premium-container relative z-10">
        <FadeIn className="mb-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-primary w-10" />
            <span className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">
              Deployment Flow
            </span>
          </div>
          <h2 className="text-display text-[clamp(2.8rem,5.5vw,6rem)] text-foreground max-w-2xl">
            From Zero to{' '}
            <span className="italic-serif text-primary">Live Tenant,</span> in
            Minutes.
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
          {steps.map((step, i) => (
            <FadeIn key={i} delay={i * 120} direction="up">
              <div className="bg-background p-8 md:p-10 lg:p-12 h-full group hover:bg-primary/2.5 transition-colors duration-500 relative">
                <div className="text-[clamp(3rem,6vw,6rem)] font-black text-primary/8 leading-none mb-6 transition-all duration-500 group-hover:text-primary/18 select-none">
                  {step.number}
                </div>
                <h3 className="text-xl font-black text-foreground mb-4 uppercase tracking-tight">
                  {step.title}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed font-medium">
                  {step.desc}
                </p>
                {i < steps.length - 1 && (
                  <div className="hidden lg:flex absolute right-0 top-10 translate-x-1/2 w-5 h-5 bg-primary/15 border border-primary/30 items-center justify-center rounded-full z-10">
                    <ArrowRight className="w-3 h-3 text-primary" />
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- Security Section ---
function SecuritySection() {
  const pillars = [
    {
      icon: Lock,
      title: 'AES-256 Encryption',
      desc: 'All data encrypted at rest and in transit. No exceptions.',
    },
    {
      icon: Server,
      title: 'Isolated Infrastructure',
      desc: 'Per-tenant data isolation with zero cross-contamination architecture.',
    },
    {
      icon: FileCheck,
      title: 'Compliance Ready',
      desc: 'Built for KYC/AML regulatory requirements across jurisdictions.',
    },
    {
      icon: Eye,
      title: 'Full Audit Trails',
      desc: 'Every action logged, timestamped, and auditable by authorized personnel.',
    },
    {
      icon: ShieldCheck,
      title: 'Penetration Tested',
      desc: 'Regular third-party security assessments on all critical systems.',
    },
    {
      icon: Zap,
      title: '99.9% Uptime SLA',
      desc: 'Multi-region redundancy with automatic failover and recovery.',
    },
  ]
  return (
    <section
      id="security"
      className="section-spacing bg-primary text-primary-foreground relative overflow-hidden"
    >
      <div className="absolute inset-0 dot-grid opacity-[0.06]" />
      <div className="absolute -right-96 -top-96 size-200 rounded-full bg-white/5 blur-[200px]" />
      <div className="premium-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-start">
          <FadeIn direction="left">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px bg-white/20 w-10" />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white/50">
                Enterprise Security
              </span>
            </div>
            <h2 className="text-display text-[clamp(2.8rem,5.5vw,6rem)] text-white mb-8 text-balance">
              Bank-Grade Security.
              <br />
              <span className="italic-serif text-white/60">By Design.</span>
            </h2>
            <p className="text-xl text-white/60 leading-relaxed font-medium mb-12 max-w-lg">
              Security isn't a feature — it's the foundation. Every layer of the
              CropCapital platform is built to protect your operators,
              investors, and data.
            </p>
            <div className="grid grid-cols-2 gap-6">
              {[
                { val: '0', label: 'Security Breaches' },
                { val: '256-bit', label: 'Encryption Standard' },
                { val: '99.9%', label: 'Uptime Guarantee' },
                { val: '24/7', label: 'Monitoring' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="border border-white/10 p-6 bg-white/5"
                >
                  <div className="text-3xl lg:text-4xl font-black text-white mb-1">
                    {s.val}
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn direction="right" delay={200}>
            <div className="grid grid-cols-1 gap-0 border border-white/10">
              {pillars.map((p, i) => {
                const Icon = p.icon
                return (
                  <div
                    key={i}
                    className="flex gap-6 p-8 border-b border-white/10 last:border-b-0 group hover:bg-white/5 transition-colors duration-300"
                  >
                    <div className="w-10 h-10 shrink-0 border border-white/15 flex items-center justify-center text-white/70 group-hover:text-white group-hover:border-white/30 transition-all">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-black uppercase tracking-tight text-white mb-1">
                        {p.title}
                      </h4>
                      <p className="text-sm text-white/50 leading-relaxed font-medium">
                        {p.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

// --- Testimonials Section ---
function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        'CropCapital cut our brand deployment time from weeks to minutes. We launched three sub-brands across different regions without a single engineering sprint.',
      name: 'Emeka Nwosu',
      role: 'CTO, AgriVenture Capital',
      initial: 'E',
    },
    {
      quote:
        'The RBAC system is bulletproof. Our compliance team was finally satisfied that investor data is truly isolated between brands. No other platform offered this out of the box.',
      name: 'Zanele Dlamini',
      role: 'COO, Harvest Equity Partners',
      initial: 'Z',
    },
  ]
  return (
    <section className="section-spacing relative overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-40" />
      <div className="premium-container relative z-10">
        <FadeIn className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-primary w-10" />
            <span className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">
              Operator Voices
            </span>
          </div>
          <h2 className="text-display text-[clamp(2.8rem,5.5vw,6rem)] text-foreground max-w-2xl">
            Trusted by{' '}
            <span className="italic-serif text-primary">Leading Teams.</span>
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {testimonials.map((t, i) => (
            <FadeIn
              key={i}
              delay={i * 200}
              direction={i === 0 ? 'left' : 'right'}
            >
              <div className="feature-card bg-background p-8 sm:p-12 lg:p-16 h-full flex flex-col">
                <div className="text-[80px] leading-none text-primary/10 font-black mb-2 -mt-4 select-none">
                  "
                </div>
                <p className="text-xl lg:text-2xl text-foreground leading-relaxed mb-10 flex-1 font-medium italic">
                  {t.quote}
                </p>
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center font-black text-lg shrink-0">
                    {t.initial}
                  </div>
                  <div>
                    <div className="font-black uppercase tracking-widest text-sm text-foreground">
                      {t.name}
                    </div>
                    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                      {t.role}
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- CTA Section ---
function CTASection() {
  return (
    <section className="section-spacing px-6 lg:px-16 relative">
      <div className="premium-container">
        <FadeIn>
          <div className="bg-primary relative overflow-hidden py-14 sm:py-24 lg:py-40 px-8 sm:px-10 lg:px-24">
            <div className="absolute inset-0 dot-grid opacity-[0.08]" />
            <div className="absolute -right-48 -top-48 w-60px] h-60px] rounded-full bg-white/5 blur-[120px]" />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px bg-white/20 w-10" />
                  <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white/50">
                    Operator Access
                  </span>
                </div>
                <h2 className="text-display text-[clamp(2.8rem,5.5vw,6rem)] text-white mb-6">
                  Infrastructure
                  <br />
                  <span className="italic-serif text-white/60">
                    Built to Scale.
                  </span>
                </h2>
                <p className="text-xl text-white/55 leading-relaxed font-medium max-w-md">
                  High-performance teams demand absolute reliability, security,
                  and the ability to deploy new brands in minutes — not months.
                </p>
              </div>
              <div className="flex flex-col gap-5 lg:items-end">
                <Link to="/auth">
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-white/95 h-14 px-12 text-sm font-black uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
                  >
                    Enter Dashboard{' '}
                    <ArrowRight className="w-5 h-5 ml-3 inline" />
                  </Button>
                </Link>
                <a
                  href="mailto:support@cropcapital.com"
                  className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/35 hover:text-white/65 transition-colors text-center lg:text-right"
                >
                  Request a demo instead
                </a>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

// --- Root Route ---
function RootRoute() {
  return (
    <div className="min-h-screen selection:bg-primary selection:text-primary-foreground relative">
      <Navbar />
      <main>
        <HeroSection />
        <StatsBar />
        <FeaturesSection />
        <ProcessSection />
        <SecuritySection />
        <TestimonialsSection />
        <CTASection />
      </main>

      <footer className="py-20 lg:py-28 bg-secondary text-secondary-foreground relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-5" />
        <div className="premium-container relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-16 mb-16">
            <div className="sm:col-span-2 lg:col-span-5">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-black text-sm">
                    CC
                  </span>
                </div>
                <div>
                  <div className="text-base font-black uppercase tracking-[0.22em]">
                    CropCapital
                  </div>
                  <div className="text-[9px] font-black uppercase tracking-[0.35em] text-primary-foreground/50">
                    Platform Infrastructure
                  </div>
                </div>
              </div>
              <p className="text-secondary-foreground/55 text-lg leading-relaxed mb-10 max-w-sm font-medium">
                The definitive institutional infrastructure for launching and
                scaling agricultural investment brands globally.
              </p>
              <div className="flex gap-8">
                {['Twitter', 'LinkedIn'].map((s) => (
                  <a
                    key={s}
                    href="#"
                    className="text-[11px] font-black uppercase tracking-[0.35em] text-secondary-foreground/35 hover:text-primary-foreground transition-colors"
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2">
              <h4 className="font-black text-[10px] uppercase tracking-[0.45em] text-primary-foreground/60 mb-8">
                Platform
              </h4>
              <ul className="space-y-4 text-secondary-foreground/50 font-bold text-base">
                {[
                  { label: 'Features', href: '#features' },
                  { label: 'How It Works', href: '#process' },
                  { label: 'Security', href: '#security' },
                ].map((i) => (
                  <li key={i.label}>
                    <a
                      href={i.href}
                      className="hover:text-primary-foreground transition-colors"
                    >
                      {i.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="font-black text-[10px] uppercase tracking-[0.45em] text-primary-foreground/60 mb-8">
                Support
              </h4>
              <ul className="space-y-4 text-secondary-foreground/50 font-bold text-base">
                {[
                  { label: 'Help Center', href: '/support' },
                  {
                    label: 'Contact Us',
                    href: 'mailto:support@cropcapital.com',
                  },
                  { label: 'System Status', href: '#' },
                ].map((i) => (
                  <li key={i.label}>
                    <a
                      href={i.href}
                      className="hover:text-primary-foreground transition-colors"
                    >
                      {i.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-3">
              <h4 className="font-black text-[10px] uppercase tracking-[0.45em] text-primary-foreground/60 mb-8">
                Legal
              </h4>
              <ul className="space-y-4 text-secondary-foreground/50 font-bold text-base">
                {[
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Terms of Service', href: '/terms' },
                  { label: 'Platform Compliance', href: '#' },
                ].map((i) => (
                  <li key={i.label}>
                    <a
                      href={i.href}
                      className="hover:text-primary-foreground transition-colors"
                    >
                      {i.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-secondary-foreground/30">
              © {new Date().getFullYear()} CropCapital Global Infrastructure.
              All rights reserved.
            </p>
            <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.25em] text-primary-foreground/40">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              All Systems Operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
