import { useState } from 'react'
import {
  createFileRoute,
  isRedirect,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { Eye, EyeOff, Mail } from 'lucide-react'
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
  component: SuperAdminAuthPage,
})

function SuperAdminAuthPage() {
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
            toast.error('This sign-in page is for super admins only')
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
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Super Admin Sign In
        </h1>
        <p className="text-muted-foreground mb-6">
          Access CropCapital tenant onboarding and platform controls.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Mail className="input-icon w-5 h-5" />
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full btn-primary-gradient"
            disabled={isPending}
          >
            {isPending ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  )
}
