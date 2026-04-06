import { useForm } from '@mantine/form'
import { useMutation } from '@tanstack/react-query'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { zodResolver } from 'mantine-form-zod-resolver'
import { useState } from 'react'
import { toast } from 'sonner'

import {
  PASSWORD_REQUIREMENTS_HINT,
  activateAdminSchema,
} from '@/api/auth/schema'
import { api } from '@/lib/api-builder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTenant } from '@/contexts/tenant'

export const Route = createFileRoute('/$tenant/auth/activate')({
  component: ActivateAdminPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: (search.token as string) || '',
    }
  },
})

function ActivateAdminPage() {
  const { tenant } = Route.useParams()
  const { token } = Route.useSearch()
  const { tenant: tenantConfig } = useTenant()
  const navigate = useNavigate()

  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm({
    initialValues: {
      name: '',
      password: '',
      confirmPassword: '',
    },
    validate: zodResolver(activateAdminSchema),
    validateInputOnBlur: true,
    validateInputOnChange: ['password', 'confirmPassword'],
  })

  const passwordInputProps = form.getInputProps('password')
  const confirmPasswordInputProps = form.getInputProps('confirmPassword')

  const activateMutation = useMutation({
    mutationFn: api.$use.auth.activateAdmin,
    onSuccess: () => {
      setIsSuccess(true)
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to activate account'
      toast.error(message)
    },
  })

  const handleSubmit = form.onSubmit(
    async (values) => {
      if (!token) {
        toast.error('Invalid activation token')
        return
      }

      await activateMutation.mutateAsync({
        token,
        name: values.name,
        password: values.password,
      })
    },
    (validationErrors) => {
      const message =
        validationErrors.confirmPassword ||
        validationErrors.password ||
        validationErrors.name ||
        'Please fix the highlighted fields before continuing'

      toast.error(String(message))
    },
  )

  if (!token) {
    return (
      <>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Invalid Activation Link
          </h1>
          <p className="text-muted-foreground">
            This {tenantConfig.displayName} activation link is invalid or has
            expired. Contact the platform administrator for a new invite.
          </p>
        </div>
        <Link to="/$tenant/auth/sign-in" params={{ tenant }}>
          <Button className="w-full">Go to Sign In</Button>
        </Link>
      </>
    )
  }

  if (isSuccess) {
    return (
      <>
        <div className="mb-8">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Account Activated!
          </h1>
          <p className="text-muted-foreground">
            Your {tenantConfig.displayName} admin account is ready. You're now
            signed in and can access the admin portal.
          </p>
        </div>
        <Button
          className="w-full btn-primary-gradient h-12"
          onClick={() => navigate({ to: '/$tenant', params: { tenant } })}
        >
          Go to Dashboard
        </Button>
      </>
    )
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Activate your account
        </h1>
        <p className="text-muted-foreground">
          Set your name and password to complete your {tenantConfig.displayName}{' '}
          admin account setup.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            className="mt-1.5"
            {...form.getInputProps('name')}
          />
          {form.errors.name && (
            <p className="text-sm text-red-500 mt-1">{form.errors.name}</p>
          )}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative mt-1.5">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              {...passwordInputProps}
              onChange={(event) => {
                passwordInputProps.onChange(event)
                form.validateField('confirmPassword')
              }}
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
          <p className="text-xs text-muted-foreground mt-1.5">
            {PASSWORD_REQUIREMENTS_HINT}
          </p>
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative mt-1.5">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              {...confirmPasswordInputProps}
              className="pr-20"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {form.errors.confirmPassword && (
            <p className="text-sm text-red-500 mt-1">
              {form.errors.confirmPassword}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full btn-primary-gradient h-12 text-base"
          disabled={activateMutation.isPending}
        >
          {activateMutation.isPending ? 'Activating...' : 'Activate Account'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/$tenant/auth/sign-in"
          params={{ tenant }}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Already have an account?{' '}
          <span className="text-primary font-medium hover:underline">
            Sign In
          </span>
        </Link>
      </div>
    </>
  )
}
