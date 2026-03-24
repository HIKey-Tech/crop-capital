import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Shield,
  Zap,
  Clock,
  Menu,
  X,
  ArrowUpRight,
  Play,
  CheckCircle2,
  FileText,
  TrendingUp,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useTenant } from '@/contexts/tenant'
import { useInView } from '@/hooks/use-in-view'
import { cn } from '@/lib/utils'
import { FadeIn } from '@/components/fade-in'

import farmPalmTrees from '@/assets/farm-palm-trees.jpg'
import farmCassava from '@/assets/farm-cassava.jpg'
import farmWheat from '@/assets/farm-wheat.jpg'

export const Route = createFileRoute('/$tenant/')({
  component: LandingPage,
})

function AnimatedCounter({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0)
  const { ref, isInView } = useInView({ once: true })
  useEffect(() => {
    if (!isInView) return
    let start = 0
    const timer = setInterval(() => {
      start += Math.ceil(value / 60)
      if (start >= value) { setCount(value); clearInterval(timer) }
      else setCount(start)
    }, 25)
    return () => clearInterval(timer)
  }, [isInView, value])
  return <span ref={ref as any}>{prefix}{count.toLocaleString()}{suffix}</span>
}

// --- Navbar ---
function Navbar({ tenant, tenantParam }: { tenant: any; tenantParam: string }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  useEffect(() => {
    const handle = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handle)
    return () => window.removeEventListener('scroll', handle)
  }, [])

  const navLinks = ['Portfolio', 'Strategy', 'Process', 'About']

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-700 px-6 py-6',
      isScrolled ? 'bg-background/95 backdrop-blur-2xl border-b border-border py-4 shadow-sm' : 'bg-transparent'
    )}>
      <div className="premium-container flex items-center justify-between">
        <Link to="/$tenant" params={{ tenant: tenantParam }} className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary flex items-center justify-center transition-all duration-300 group-hover:bg-primary/80">
            <span className="text-primary-foreground font-black text-sm">{tenant.shortName?.[0]}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black uppercase tracking-[0.2em] text-foreground leading-none">{tenant.displayName}</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/60 leading-none mt-0.5">Agricultural Finance</span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`}
              className="text-[11px] font-bold uppercase tracking-[0.35em] text-muted-foreground hover:text-primary transition-all relative group">
              {item}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-primary group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-5">
          <Link to="/$tenant/auth" params={{ tenant: tenantParam }} className="hidden sm:block">
            <span className="text-[11px] font-black uppercase tracking-[0.35em] text-foreground hover:text-primary transition-colors cursor-pointer">Login</span>
          </Link>
          <Link to="/$tenant/auth" params={{ tenant: tenantParam }}>
            <Button className="btn-primary-gradient h-11 px-8 text-xs font-black uppercase tracking-[0.18em]">
              Get Access
            </Button>
          </Link>
          <button className="lg:hidden p-2" onClick={() => setIsMobileOpen(true)}>
            <Menu className="w-6 h-6 text-foreground" />
          </button>
        </div>
      </div>

      <div className={cn(
        'fixed inset-0 z-[60] bg-background backdrop-blur-2xl transition-all duration-700 lg:hidden',
        isMobileOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        <div className="flex flex-col h-full p-8 sm:p-12">
          <div className="flex items-center justify-between mb-10 sm:mb-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-black text-sm">{tenant.shortName?.[0]}</span>
              </div>
              <span className="font-black uppercase tracking-[0.2em]">{tenant.displayName}</span>
            </div>
            <button onClick={() => setIsMobileOpen(false)}><X className="w-6 h-6" /></button>
          </div>
          <div className="flex flex-col gap-6">
            {navLinks.map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="text-4xl text-display text-foreground border-b border-border pb-4 hover:text-primary transition-colors"
                onClick={() => setIsMobileOpen(false)}>
                {item}
              </a>
            ))}
            <div className="mt-10">
              <Link to="/$tenant/auth" params={{ tenant: tenantParam }} onClick={() => setIsMobileOpen(false)}>
                <Button className="btn-primary-gradient w-full h-14 font-black uppercase tracking-widest text-sm">Start Portfolio</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

// --- Hero Section ---
function HeroSection({ tenantParam }: { tenantParam: string }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t) }, [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden dot-grid">
      {/* Farm image bleeds to right viewport edge — hidden on mobile */}
      <div className="hidden lg:block absolute right-0 top-0 h-full" style={{ width: 'clamp(38%, 44vw, 600px)' }}>
        <img src={farmPalmTrees} alt="Agricultural landscape"
          className="w-full h-full object-cover"
          style={{ filter: 'saturate(0.6) brightness(0.8)' }} />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to right, hsl(40 20% 98%) 0%, hsl(40 20% 98% / 0.5) 28%, transparent 60%)'
        }} />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />

        {/* Floating AUM card */}
        <div className="absolute bottom-16 left-0 -translate-x-1/3 bg-secondary text-secondary-foreground p-8 shadow-2xl hidden lg:block border-l-4 border-primary"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateX(-33%)' : 'translateX(-15%)', transition: 'opacity 1s ease 1.4s, transform 1s cubic-bezier(0.19,1,0.22,1) 1.4s' }}>
          <div className="text-4xl font-black text-primary-foreground mb-1">$11.8M</div>
          <div className="text-[10px] font-black uppercase tracking-[0.32em] text-secondary-foreground/50">Assets Under Management</div>
        </div>
      </div>

      <div className="premium-container relative z-10 w-full">
        <div className="w-full lg:max-w-[62%] py-24 sm:py-32 lg:py-44">
          <div className="flex items-center gap-4 mb-8"
            style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.8s ease 200ms' }}>
            <div className="h-px bg-primary" style={{ width: mounted ? '44px' : '0px', transition: 'width 1.2s cubic-bezier(0.19,1,0.22,1) 400ms' }} />
            <span className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">Institutional Grade Agriculture</span>
          </div>

          <h1 className="mb-9">
            {[
              { text: 'Cultivate', style: 'text-display text-foreground' },
              { text: 'Heritage', style: 'italic-serif text-primary' },
              { text: 'Capital.', style: 'text-display text-foreground' },
            ].map((line, i) => (
              <span key={i} className="block overflow-hidden mb-[-0.06em]">
                <span
                  className={cn('block text-[clamp(4rem,8vw,9rem)]', line.style)}
                  style={{ animation: mounted ? `slideRevealY 1.1s cubic-bezier(0.19,1,0.22,1) ${300 + i * 200}ms both` : 'none' }}
                >
                  {line.text}
                </span>
              </span>
            ))}
          </h1>

          <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(16px)', transition: 'opacity 0.9s ease 1s, transform 0.9s ease 1s' }}>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-10 max-w-md leading-relaxed font-medium">
              Direct access to high-yield, insured agricultural assets managed by seasoned professionals.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8">
              <Link to="/$tenant/auth" params={{ tenant: tenantParam }}>
                <Button size="lg" className="btn-primary-gradient h-14 px-12 text-sm font-black uppercase tracking-[0.18em] group">
                  Start Your Portfolio
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <button className="flex items-center gap-3 group cursor-pointer">
                <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                  <Play className="w-4 h-4 fill-current text-foreground group-hover:text-white transition-colors ml-0.5" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground group-hover:text-primary transition-colors">Watch Overview</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// --- Metrics Band ---
function MetricsBand() {
  const metrics = [
    { value: 18, suffix: '%', label: 'Avg. Annual Returns', desc: 'Net of fees, last 3 cycles' },
    { value: 2500, suffix: '', label: 'Capital Partners', desc: 'Institutional & private investors' },
    { value: 11, suffix: '.8M', label: 'Assets Under Management', prefix: '$', desc: 'Across active farm portfolios' },
  ]
  return (
    <section className="bg-secondary text-secondary-foreground relative overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-5" />
      <div className="premium-container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {metrics.map((m, i) => (
            <div key={i} className={cn(
              'py-10 lg:py-20 px-6 sm:px-10 lg:px-14 border-b md:border-b-0 md:border-r border-white/10 last:border-r-0 last:border-b-0',
              i === 0 && 'border-t-4 border-t-primary'
            )}>
              <FadeIn delay={i * 120}>
                <div className="text-[clamp(2.8rem,5vw,4.5rem)] font-black text-primary-foreground leading-none mb-2 tracking-tight">
                  <AnimatedCounter value={m.value} suffix={m.suffix} prefix={m.prefix} />
                </div>
                <div className="text-base font-black text-secondary-foreground uppercase tracking-tight mb-2">{m.label}</div>
                <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-secondary-foreground/40">{m.desc}</div>
              </FadeIn>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- Farm Card ---
function FarmCard({ farm, tenantParam, tall }: { farm: any; tenantParam: string; tall?: boolean }) {
  return (
    <div className="group relative overflow-hidden bg-background feature-card cursor-pointer">
      <div className="overflow-hidden" style={{ aspectRatio: tall ? '4/5' : '4/6' }}>
        <img src={farm.img} alt={farm.name}
          className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
          style={{ filter: 'saturate(0.35) brightness(0.8)', transition: 'transform 1s ease, filter 0.7s ease' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.filter = 'saturate(0.85) brightness(0.88)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.filter = 'saturate(0.35) brightness(0.8)' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-8 transform transition-all duration-500 group-hover:-translate-y-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px bg-primary w-6 transition-all duration-500 group-hover:w-10" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{farm.location}</span>
        </div>
        <h3 className="text-display text-[clamp(1.3rem,2.5vw,2rem)] text-foreground mb-5 group-hover:text-primary transition-colors duration-300">{farm.name}</h3>
        <div className="flex justify-between items-end">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground mb-1">Target Yield</div>
            <div className="text-3xl font-black text-primary">{farm.roi}</div>
          </div>
          <Link to="/$tenant/farms" params={{ tenant: tenantParam }}>
            <button className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] text-foreground hover:text-primary transition-colors">
              Explore <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

// --- Portfolio Section ---
function PortfolioSection({ tenantParam }: { tenantParam: string }) {
  const farms = [
    { name: 'Owerri Cassava Cluster', location: 'Eastern Region', roi: '18.5%', img: farmCassava },
    { name: 'Plateau Wheat Valley', location: 'Northern Highlands', roi: '22.0%', img: farmWheat },
    { name: 'Kano Palm Paddies', location: 'Central Basin', roi: '15.8%', img: farmPalmTrees },
  ]
  return (
    <section id="portfolio" className="section-spacing">
      <div className="premium-container">
        <div className="flex flex-col lg:flex-row justify-between items-end mb-20 gap-10">
          <FadeIn className="max-w-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-primary w-10" />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">Active Opportunities</span>
            </div>
            <h2 className="text-display text-[clamp(3.2rem,6vw,7rem)] text-foreground">
              Portfolio<br /><span className="italic-serif text-primary">Spotlights.</span>
            </h2>
          </FadeIn>
          <FadeIn delay={200}>
            <Link to="/$tenant/farms" params={{ tenant: tenantParam }}>
              <Button variant="outline"
                className="h-12 px-10 rounded-none border-2 border-foreground font-black uppercase tracking-[0.28em] text-[11px] hover:bg-foreground hover:text-background transition-all duration-300">
                View Full Catalog <ArrowRight className="w-4 h-4 ml-3 inline" />
              </Button>
            </Link>
          </FadeIn>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {farms.map((farm, i) => (
            <FadeIn key={i} delay={i * 150} direction="up">
              <FarmCard farm={farm} tenantParam={tenantParam} tall={i === 1} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- Strategy Section ---
function StrategySection() {
  const pillars = [
    { icon: Zap, title: 'Asset Selection', desc: 'Rigorous 5-step vetting including soil analytics, climate modeling, and crop-cycle forecasting.' },
    { icon: Shield, title: 'Risk Mitigation', desc: 'Comprehensive agricultural insurance covering yield loss, weather events, and commodity price shifts.' },
    { icon: Clock, title: 'Real-Time Reporting', desc: 'Daily growth telemetry, weekly drone surveillance footage, and live portfolio dashboards.' },
  ]
  return (
    <section id="strategy" className="section-spacing bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-[0.06]" />
      <div className="absolute -right-96 -top-96 w-[800px] h-[800px] rounded-full bg-white/5 blur-[200px]" />
      <div className="premium-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start lg:items-center">
          <FadeIn direction="left">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-px bg-white/20 w-10" />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white/50">Investment Methodology</span>
            </div>
            <h2 className="text-display text-[clamp(3rem,5.5vw,6.5rem)] text-white mb-14 text-balance">
              A data-driven <span className="italic-serif text-white/60">growth engine.</span>
            </h2>
            <div className="space-y-12">
              {pillars.map((p, i) => {
                const Icon = p.icon
                return (
                  <div key={i} className="flex gap-7 group">
                    <div className="w-12 h-12 flex-shrink-0 border border-white/15 flex items-center justify-center text-white/70 transition-all duration-300 group-hover:bg-white group-hover:text-primary group-hover:border-white">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-black uppercase tracking-tight text-white mb-2">{p.title}</h4>
                      <p className="text-white/50 leading-relaxed font-medium">{p.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </FadeIn>

          <FadeIn direction="right" delay={300}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                <div className="aspect-square bg-white/5 border border-white/10 p-8 flex flex-col justify-end backdrop-blur-sm">
                  <div className="text-[clamp(2.5rem,5vw,3.5rem)] font-black text-white mb-2">
                    <AnimatedCounter value={18} suffix="%" />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-[0.25em] text-white/45">Avg. Annual Returns</div>
                </div>
                <div className="aspect-[4/5] overflow-hidden">
                  <img src={farmCassava} className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105" style={{ filter: 'saturate(0.25) brightness(0.55)' }} />
                </div>
              </div>
              <div className="space-y-4">
                <div className="aspect-[4/5] overflow-hidden">
                  <img src={farmWheat} className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105" style={{ filter: 'saturate(0.25) brightness(0.55)' }} />
                </div>
                <div className="aspect-square bg-white p-8 flex flex-col justify-end">
                  <div className="text-[clamp(2.5rem,5vw,3.5rem)] font-black text-primary mb-2">
                    <AnimatedCounter value={2500} suffix="+" />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/60">Active Partners</div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

// --- Investment Process Section ---
function ProcessSection() {
  const steps = [
    { number: '01', icon: Users, title: 'Create Account', desc: 'Sign up and complete our streamlined KYC verification process. Takes under 10 minutes.' },
    { number: '02', icon: TrendingUp, title: 'Browse Opportunities', desc: 'Explore our curated portfolio of high-yield agricultural assets across regions.' },
    { number: '03', icon: FileText, title: 'Invest & Monitor', desc: 'Fund your allocation and track real-time performance through your investor dashboard.' },
    { number: '04', icon: CheckCircle2, title: 'Receive Returns', desc: 'Quarterly distributions directly to your wallet, with full reporting and tax statements.' },
  ]
  return (
    <section id="process" className="section-spacing bg-muted/30 border-y border-border relative overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-60" />
      <div className="premium-container relative z-10">
        <FadeIn className="mb-24">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-primary w-10" />
            <span className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">How It Works</span>
          </div>
          <h2 className="text-display text-[clamp(3.2rem,6vw,7rem)] text-foreground max-w-2xl">
            Invest in <span className="italic-serif text-primary">Four Steps.</span>
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <FadeIn key={i} delay={i * 120} direction="up">
                <div className="bg-background p-8 md:p-10 lg:p-12 h-full group hover:bg-primary/[0.025] transition-colors duration-500 relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-[clamp(2.5rem,4vw,4.5rem)] font-black text-primary/10 leading-none transition-all duration-500 group-hover:text-primary/20 select-none">
                      {step.number}
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center mb-6">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-foreground mb-4 uppercase tracking-tight">{step.title}</h3>
                  <p className="text-base text-muted-foreground leading-relaxed font-medium">{step.desc}</p>
                  {i < steps.length - 1 && (
                    <div className="hidden lg:flex absolute right-0 top-10 translate-x-1/2 w-5 h-5 bg-primary/15 border border-primary/30 items-center justify-center rounded-full z-10">
                      <ArrowRight className="w-3 h-3 text-primary" />
                    </div>
                  )}
                </div>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// --- Safety & Assurance Section ---
function SafetySection({ tenantParam }: { tenantParam: string }) {
  const guarantees = [
    { icon: Shield, title: 'Comprehensive Insurance', desc: 'Every farm investment is backed by agricultural insurance covering yield loss, extreme weather, and pest damage.' },
    { icon: FileText, title: 'Regulatory Compliance', desc: 'Full KYC/AML compliance across all jurisdictions. Your investment is protected by law.' },
    { icon: TrendingUp, title: 'Transparent Reporting', desc: 'Monthly performance statements, quarterly audits, and real-time dashboard access. No hidden information.' },
    { icon: Clock, title: 'Experienced Operators', desc: 'Farms managed by agricultural professionals with 10+ years of on-ground experience in each region.' },
  ]
  return (
    <section id="risk" className="section-spacing relative">
      <div className="absolute inset-0 dot-grid opacity-40" />
      <div className="premium-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-32 items-start">
          <FadeIn direction="left">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px bg-primary w-10" />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">Capital Protection</span>
            </div>
            <h2 className="text-display text-[clamp(3.2rem,6vw,7rem)] text-foreground mb-8 text-balance">
              Your Capital,<br /><span className="italic-serif text-primary">Protected.</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed font-medium mb-14 max-w-lg">
              Agricultural investment carries inherent risk. We've built comprehensive safeguards at every layer to protect your allocation and maximise predictable returns.
            </p>
            <Link to="/$tenant/auth" params={{ tenant: tenantParam }}>
              <Button size="lg" className="btn-primary-gradient h-14 px-10 text-sm font-black uppercase tracking-[0.18em] group">
                Start Investing
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </FadeIn>

          <FadeIn direction="right" delay={200}>
            <div className="grid grid-cols-1 gap-0 border border-border">
              {guarantees.map((g, i) => {
                const Icon = g.icon
                return (
                  <div key={i} className="flex gap-6 p-8 border-b border-border last:border-b-0 group hover:bg-primary/[0.025] transition-colors duration-300">
                    <div className="w-10 h-10 flex-shrink-0 bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-black uppercase tracking-tight text-foreground mb-2">{g.title}</h4>
                      <p className="text-base text-muted-foreground leading-relaxed font-medium">{g.desc}</p>
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

// --- Testimonials ---
function TestimonialsSection() {
  const testimonials = [
    {
      text: 'CropCapital has transformed agricultural investment from a speculative venture into a predictable, institutional asset class.',
      name: 'Marcus Adebayo', role: 'Venture Capitalist',
    },
    {
      text: 'The level of telemetry and transparency is significantly higher than what I see in traditional REITs. This is the future of asset-backed investment.',
      name: 'Elena Vance', role: 'Portfolio Manager',
    },
  ]
  return (
    <section id="insights" className="section-spacing bg-muted/30 border-y border-border relative overflow-hidden">
      <div className="premium-container">
        <FadeIn className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-primary w-10" />
            <span className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">Investor Perspective</span>
          </div>
          <h2 className="text-display text-[clamp(3.2rem,6vw,7rem)] text-foreground max-w-xl">
            What Partners <span className="italic-serif text-primary">Are Saying.</span>
          </h2>
        </FadeIn>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {testimonials.map((t, i) => (
            <FadeIn key={i} delay={i * 200} direction={i === 0 ? 'left' : 'right'}>
              <div className="feature-card bg-background p-8 sm:p-12 lg:p-16 h-full flex flex-col">
                <div className="text-[80px] leading-none text-primary/10 font-black mb-2 -mt-4 select-none">"</div>
                <p className="text-lg sm:text-xl lg:text-2xl text-foreground leading-relaxed mb-10 flex-1 font-medium italic">{t.text}</p>
                <div className="flex items-center gap-5">
                  <div className="h-px bg-primary w-10" />
                  <div>
                    <div className="font-black uppercase tracking-widest text-sm text-foreground">{t.name}</div>
                    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{t.role}</div>
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
function CTASection({ tenantParam }: { tenantParam: string }) {
  return (
    <section className="section-spacing relative overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/4 rounded-full blur-[120px]" />
      <div className="premium-container relative z-10 text-center">
        <FadeIn>
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="h-px bg-primary w-10" />
            <span className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">Limited Allocations Open</span>
            <div className="h-px bg-primary w-10" />
          </div>
          <h2 className="text-display text-[clamp(3rem,8vw,9rem)] text-foreground mb-8 text-balance">
            Secure Your<br /><span className="italic-serif text-primary">Allocation.</span>
          </h2>
          <p className="text-xl lg:text-2xl text-muted-foreground mb-14 max-w-2xl mx-auto font-medium leading-relaxed">
            Limited high-yield cycles are now open for institutional and private capital. Join the new era of agricultural finance.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Link to="/$tenant/auth" params={{ tenant: tenantParam }}>
              <Button size="lg" className="btn-primary-gradient h-16 px-14 text-sm font-black uppercase tracking-[0.18em] group">
                Create Private Account
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="mailto:invest@cropcapital.com"
              className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors">
              Speak with an advisor first
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-16 border-t border-border">
            {['Insured Assets', 'Regulated Platform', 'Quarterly Distributions', 'Transparent Reporting'].map((s) => (
              <div key={s} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {s}
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

// --- Landing Page ---
function LandingPage() {
  const { tenant: tenantParam } = Route.useParams()
  const { tenant } = useTenant()

  return (
    <div className="min-h-screen relative selection:bg-primary selection:text-primary-foreground">
      <Navbar tenant={tenant} tenantParam={tenantParam} />
      <main>
        <HeroSection tenantParam={tenantParam} />
        <MetricsBand />
        <PortfolioSection tenantParam={tenantParam} />
        <StrategySection />
        <ProcessSection />
        <SafetySection tenantParam={tenantParam} />
        <TestimonialsSection />
        <CTASection tenantParam={tenantParam} />
      </main>

      <footer className="bg-secondary text-secondary-foreground py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-5" />
        <div className="premium-container relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-16 mb-16">
            <div className="sm:col-span-2 lg:col-span-6">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-black text-sm">{tenant.shortName?.[0]}</span>
                </div>
                <div>
                  <div className="text-base font-black uppercase tracking-[0.2em]">{tenant.displayName}</div>
                  <div className="text-[9px] font-black uppercase tracking-[0.3em] text-primary-foreground/50">Agricultural Finance</div>
                </div>
              </div>
              <p className="text-secondary-foreground/50 text-lg leading-relaxed max-w-md font-medium mb-12">
                Pioneering the synthesis of institutional finance and sustainable agricultural production across the African continent.
              </p>
              <div className="flex gap-10">
                {['LinkedIn', 'Twitter'].map((s) => (
                  <a key={s} href="#" className="text-[11px] font-black uppercase tracking-[0.3em] text-secondary-foreground/35 hover:text-primary-foreground transition-colors">{s}</a>
                ))}
              </div>
            </div>
            <div className="lg:col-span-3">
              <h4 className="text-[10px] font-black uppercase tracking-[0.45em] text-primary-foreground/50 mb-8">Investments</h4>
              <ul className="space-y-4 text-base font-bold text-secondary-foreground/45">
                {[
                  { label: 'Farm Portfolio', href: '#portfolio' },
                  { label: 'How It Works', href: '#process' },
                  { label: 'Strategy', href: '#strategy' },
                  { label: 'Risk Management', href: '#risk' },
                ].map((item) => (
                  <li key={item.label}><a href={item.href} className="hover:text-primary-foreground transition-colors">{item.label}</a></li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-3">
              <h4 className="text-[10px] font-black uppercase tracking-[0.45em] text-primary-foreground/50 mb-8">Legal</h4>
              <ul className="space-y-4 text-base font-bold text-secondary-foreground/45">
                <li><Link to="/$tenant/privacy" params={{ tenant: tenantParam }} className="hover:text-primary-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link to="/$tenant/terms" params={{ tenant: tenantParam }} className="hover:text-primary-foreground transition-colors">Terms of Access</Link></li>
                <li><Link to="/$tenant/support" params={{ tenant: tenantParam }} className="hover:text-primary-foreground transition-colors">Help & Support</Link></li>
                <li><Link to="/$tenant/disclosures" params={{ tenant: tenantParam }} className="hover:text-primary-foreground transition-colors">Disclosures</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-secondary-foreground/30">
              © {new Date().getFullYear()} {tenant.legalName || tenant.displayName}. All rights reserved.
            </p>
            <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.25em] text-primary-foreground/40">
              <Shield className="w-3.5 h-3.5 text-primary-foreground/60" />
              Encrypted Secure Portal
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
