import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Lock, Mail, User } from 'lucide-react'

import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const Route = createFileRoute('/auth')({
  component: AuthPage,
})

type AuthMode = 'signin' | 'signup'

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

function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    country: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (mode === 'signin') {
      toast.success('Welcome back!')
    } else {
      toast.success('Account created successfully!')
    }

    setIsLoading(false)
    navigate({ to: '/dashboard' })
  }

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
              African Youth Forum
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

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">AYF</span>
            </div>
            <span className="text-xl font-bold text-foreground">
              African Youth Forum
            </span>
          </div>

          <div className="mb-8">
            <p className="text-muted-foreground mb-1">
              Welcome! Please sign in or create a new account below.
            </p>
            <h1 className="text-3xl font-bold text-foreground">
              {mode === 'signin' ? 'Sign In' : 'Sign Up'} to{' '}
              <span className="text-primary">AYF</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div>
                <Label htmlFor="name">Name</Label>
                <div className="relative mt-1.5">
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="pr-10"
                  />
                  <User className="input-icon w-5 h-5" />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1.5">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
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
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  className="pr-10"
                />
                <Lock className="input-icon w-5 h-5" />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <Label htmlFor="country">Country</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) =>
                    setFormData({ ...formData, country: value })
                  }
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              type="submit"
              className="w-full btn-primary-gradient h-12 text-base"
              disabled={isLoading}
            >
              {isLoading ? 'Please wait...' : 'Create account'}
            </Button>
          </form>

          <div className="mt-4">
            <Button
              variant="outline"
              className="w-full h-12 bg-muted border-0"
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign up with Google
            </Button>
          </div>

          <p className="text-center text-muted-foreground mt-6">
            {mode === 'signin' ? (
              <>
                Don&apos;t have any account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-primary font-medium hover:underline"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-primary font-medium hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
