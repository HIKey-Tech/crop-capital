import { useState } from 'react'
import {
  Link,
  createFileRoute,
  isRedirect,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  Mail,
  ShieldCheck,
} from 'lucide-react'
import { toast } from 'sonner'

import { clearAuthToken, getAuthToken } from '@/lib/api-client'
import { api } from '@/lib/api-builder'
import { useLogin } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const Route = createFileRoute('/auth')({
  beforeLoad: async ({ context }) => {
    const token = getAuthToken()
    if (!token) return

    // User is already signed in
    try {
      const response = await context.queryClient.ensureQueryData({
        queryKey: api.auth.me.$use(),
        queryFn: () => api.$use.auth.me(),
        staleTime: 1000 * 60 * 5,
      })

      if (response.user.role === 'super_admin') {
        throw redirect({ to: '/super-admin' })
      }

      clearAuthToken()
    } catch (error) {
      if (isRedirect(error)) throw error

      // Auth check failed — let them proceed to auth page
      clearAuthToken()
    }
  },
  component: PlatformAccessPage,
})

function PlatformAccessPage() {
  const { mutate: login, isPending } = useLogin()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim() || !password.trim()) {
      toast.error('Email and password are required')
      return
    }

    login(
      { email: email.trim(), password },
      {
        onSuccess: (response) => {
          if (response.user.role !== 'super_admin') {
            clearAuthToken()
            toast.error('This workspace is restricted to platform operators')
            return
          }

          toast.success('Welcome back')
          navigate({ to: '/super-admin' })
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Failed to sign in')
        },
      },
    )
  }

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden border-r border-border bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.24),transparent_34%),linear-gradient(160deg,hsl(var(--card)),hsl(var(--muted))_55%,hsl(var(--card)))] lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-16 right-8 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="relative max-w-xl space-y-8">
          <Link to="/" className="inline-flex items-center gap-3 rounded-full border border-border/80 bg-background/70 px-4 py-2 backdrop-blur">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                CropCapital
              </p>
              <p className="text-xs text-muted-foreground">
                Platform operations workspace
              </p>
            </div>
          </Link>

          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">
              Controlled access
            </p>
            <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-foreground xl:text-5xl">
              Manage tenant provisioning without exposing the control surface.
            </h1>
            <p className="max-w-lg text-base leading-7 text-muted-foreground xl:text-lg">
              This entry is reserved for platform operators handling tenant
              configuration, readiness, and lifecycle tasks. Investor and
              tenant-admin access remains on tenant-specific routes.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-border/80 bg-background/70 p-5 backdrop-blur">
              <ShieldCheck className="mb-4 h-5 w-5 text-primary" />
              <h2 className="mb-2 text-sm font-semibold text-foreground">
                Restricted workspace
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Access is role-checked after sign-in and non-operator accounts
                are denied immediately.
              </p>
            </div>
            <div className="rounded-3xl border border-border/80 bg-background/70 p-5 backdrop-blur">
              <ArrowRight className="mb-4 h-5 w-5 text-primary" />
              <h2 className="mb-2 text-sm font-semibold text-foreground">
                Tenant users
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Investors and tenant admins should continue from their own
                tenant links such as{' '}
                <span className="text-foreground">
                  /cropcapital/auth/sign-in
                </span>
                .
              </p>
            </div>
          </div>
        </div>

        <div className="relative rounded-3xl border border-border/80 bg-background/70 p-6 backdrop-blur">
          <p className="text-sm text-muted-foreground">Workspace scope</p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm text-foreground">
            <span className="rounded-full bg-primary/10 px-3 py-1">
              Tenant setup
            </span>
            <span className="rounded-full bg-primary/10 px-3 py-1">
              Feature control
            </span>
            <span className="rounded-full bg-primary/10 px-3 py-1">
              Readiness review
            </span>
            <span className="rounded-full bg-primary/10 px-3 py-1">
              Lifecycle actions
            </span>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md rounded-4xl border border-border bg-card/95 p-6 shadow-xl shadow-primary/5 backdrop-blur sm:p-8">
          <div className="mb-8 lg:hidden">
              <Link to="/" className="mb-5 inline-flex items-center gap-3 rounded-full border border-border px-4 py-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    CropCapital
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Platform operations workspace
                  </p>
                </div>
            </Link>
          </div>

          <div className="mb-8 space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">
              Platform access
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              Sign in to continue
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Use your authorized operator credentials. If you are trying to
              access a tenant workspace, use the tenant-specific sign-in link
              instead.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1.5">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  className="pr-10"
                />
                <Mail className="input-icon h-5 w-5" />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="pr-20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full btn-primary-gradient h-12 text-base"
              disabled={isPending}
            >
              {isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </section>
    </div>
  )
}
