import { useForm } from '@mantine/form'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff, Mail } from 'lucide-react'
import { zodResolver } from 'mantine-form-zod-resolver'
import { useState } from 'react'
import { toast } from 'sonner'

import { loginSchema } from '@/api/auth/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLogin } from '@/hooks/use-auth'
import { useTenant } from '@/contexts/tenant'

export const Route = createFileRoute('/$tenant/auth/sign-in/')({
  component: SignInPage,
})

function SignInPage() {
  const { mutate: login, isPending } = useLogin()
  const { tenant: tenantParam } = Route.useParams()
  const { tenant } = useTenant()
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: zodResolver(loginSchema),
  })

  const handleSubmit = form.onSubmit((values) => {
    login(values, {
      onSuccess: () => {
        toast.success('Welcome back!', {
          style: {
            background: 'hsl(var(--popover))',
            opacity: 1,
          },
        })
        navigate({
          to: '/$tenant/dashboard',
          params: { tenant: tenantParam },
        })
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to sign in')
      },
    })
  })

  return (
    <>
      <div className="mb-8">
        <p className="text-muted-foreground mb-1">
          Welcome back! Please sign in to your account.
        </p>
        <h1 className="text-3xl font-bold text-foreground">
          Sign In to <span className="text-primary">{tenant.shortName}</span>
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="email">Email</Label>
          <div className="relative mt-1.5">
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...form.getInputProps('email')}
              className="pr-10"
            />
            <Mail className="input-icon w-5 h-5" />
          </div>
          {form.errors.email && (
            <p className="text-sm text-red-500 mt-1">{form.errors.email}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/$tenant/auth/forgot-password"
              params={{ tenant: tenantParam }}
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              {...form.getInputProps('password')}
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
          {form.errors.password && (
            <p className="text-sm text-red-500 mt-1">{form.errors.password}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full btn-primary-gradient h-12 text-base"
          disabled={isPending}
        >
          {isPending ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <p className="text-center text-muted-foreground mt-6">
        Don&apos;t have an account?{' '}
        <Link
          to="/$tenant/auth/sign-up"
          params={{ tenant: tenantParam }}
          className="text-primary font-medium hover:underline"
        >
          Sign Up
        </Link>
      </p>
    </>
  )
}
