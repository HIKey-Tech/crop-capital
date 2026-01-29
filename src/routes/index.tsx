import { Link, createFileRoute } from '@tanstack/react-router'

import { ArrowRight, Shield, TrendingUp, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'

import farmPalmTrees from '@/assets/farm-palm-trees.jpg'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                AYF
              </span>
            </div>
            <span className="text-lg font-bold text-foreground">
              African Youth Forum
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              How it Works
            </a>
            <a
              href="#farms"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Farms
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button className="btn-primary-gradient">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Invest in African
              <span className="text-primary"> Agriculture</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with verified farms across Liberia and West Africa. Earn
              attractive returns while empowering local communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button
                  size="lg"
                  className="btn-primary-gradient h-14 px-8 text-lg"
                >
                  Start Investing
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/discover">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg"
                >
                  Explore Farms
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div className="mt-16 relative">
            <div className="aspect-[21/9] rounded-2xl overflow-hidden shadow-ayf-lg">
              <img
                src={farmPalmTrees}
                alt="African palm tree farm"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />
            </div>

            {/* Floating Stats */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
              <div className="bg-card px-6 py-4 rounded-xl shadow-lg border border-border">
                <p className="text-2xl font-bold text-foreground">$11.8M+</p>
                <p className="text-sm text-muted-foreground">Total Invested</p>
              </div>
              <div className="bg-card px-6 py-4 rounded-xl shadow-lg border border-border">
                <p className="text-2xl font-bold text-foreground">2,500+</p>
                <p className="text-sm text-muted-foreground">
                  Active Investors
                </p>
              </div>
              <div className="bg-card px-6 py-4 rounded-xl shadow-lg border border-border hidden sm:block">
                <p className="text-2xl font-bold text-primary">18.5%</p>
                <p className="text-sm text-muted-foreground">Avg. ROI</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-muted">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Why Invest with AYF?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-xl border border-border text-center">
              <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">High Returns</h3>
              <p className="text-muted-foreground">
                Earn up to 20% annual returns on verified agricultural
                investments.
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl border border-border text-center">
              <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Verified Projects</h3>
              <p className="text-muted-foreground">
                All farms are vetted and verified before listing on our
                platform.
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl border border-border text-center">
              <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community Impact</h3>
              <p className="text-muted-foreground">
                Your investment directly supports local farmers and communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Start Investing?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of investors building wealth while supporting African
            agriculture.
          </p>
          <Link to="/auth">
            <Button
              size="lg"
              className="btn-primary-gradient h-14 px-8 text-lg"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">
                AYF
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              © 2024 African Youth Forum. All rights reserved.
            </span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-foreground">
              Terms of Service
            </a>
            <a href="#" className="hover:text-foreground">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
