import { Outlet } from '@tanstack/react-router'

const countries = [
  'Liberia',
  'Nigeria',
  'Ghana',
  'Kenya',
  'South Africa',
  'Uganda',
  'Tanzania',
  'United States',
  'United Kingdom',
]

export function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-muted flex-col items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">
                AYF
              </span>
            </div>
            <span className="text-2xl font-bold text-foreground">
              Africa Youth Forum
            </span>
          </div>

          <p className="text-muted-foreground mb-12">
            Empowering African agriculture through community-driven investments.
            Join thousands of investors building sustainable futures.
          </p>

          {/* Illustration placeholder */}
          <div className="relative mx-auto w-64 h-80">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-64 bg-card rounded-3xl border border-border shadow-lg flex flex-col items-center justify-center p-6">
                <div className="w-16 h-10 rounded-lg bg-muted flex items-center justify-center mb-4">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <div className="w-6 h-3 rounded-full bg-primary" />
                  </div>
                </div>
                <div className="space-y-2 w-full">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div className="w-full h-1.5 bg-primary/30 rounded" />
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div className="w-3/4 h-1.5 bg-primary/30 rounded" />
                </div>
                <div className="mt-auto w-16 h-8 rounded-lg bg-primary" />
              </div>
            </div>
            {/* Person illustration - simplified */}
            <div className="absolute bottom-4 right-0 w-24 h-32">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-amber-200 absolute top-0 left-1/2 -translate-x-1/2" />
                <div className="w-16 h-20 bg-primary rounded-t-2xl absolute top-6 left-1/2 -translate-x-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">AYF</span>
            </div>
            <span className="text-xl font-bold text-foreground">
              Africa Youth Forum
            </span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  )
}

export { countries }
