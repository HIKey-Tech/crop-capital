import { useForm } from '@mantine/form'
import { useMutation } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { zodResolver } from 'mantine-form-zod-resolver'
import { useState } from 'react'
import { toast } from 'sonner'

import { api } from '@/lib/api-builder'
import { resetPasswordSchema } from '@/api/auth/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTenant } from '@/contexts/tenant'

export const Route = createFileRoute('/$tenant/auth/reset-password/')({
  component: ResetPasswordPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: (search.token as string) || '',
    }
  },
})

function ResetPasswordPage() {
  const { tenant } = Route.useParams()
  const { token } = Route.useSearch()
  const { tenant: tenantConfig } = useTenant()

  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validate: zodResolver(resetPasswordSchema),
  })

  const resetPasswordMutation = useMutation({
    mutationFn: api.$use.auth.resetPassword,
    onSuccess: () => {
      toast.success('Password reset successfully!')
      setIsSuccess(true)
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to reset password'
      toast.error(message)
    },
  })

  const handleSubmit = form.onSubmit(async (values) => {
    if (!token) {
      toast.error('Invalid reset token')
      return
    }

    await resetPasswordMutation.mutateAsync({
      token,
      password: values.password,
    })
  })

  if (!token) {
    return (
      <>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Invalid Reset Link
          </h1>
          <p className="text-muted-foreground">
            This {tenantConfig.displayName} password reset link is invalid or
            has expired.
          </p>
        </div>
        <Link to="/$tenant/auth/forgot-password" params={{ tenant }}>
          <Button className="w-full">Request New Reset Link</Button>
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
            Password Reset Complete!
          </h1>
          <p className="text-muted-foreground">
            Your {tenantConfig.displayName} password has been reset. You can now
            sign in with your new password.
          </p>
        </div>
        <Link to="/$tenant/auth/sign-in" params={{ tenant }}>
          <Button className="w-full btn-primary-gradient h-12">
            Continue to Sign In
          </Button>
        </Link>
      </>
    )
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Reset your password
        </h1>
        <p className="text-muted-foreground">
          Enter a new password for your {tenantConfig.displayName} account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="password">New Password</Label>
          <div className="relative mt-1.5">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
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

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative mt-1.5">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              {...form.getInputProps('confirmPassword')}
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
          disabled={resetPasswordMutation.isPending}
        >
          {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/$tenant/auth/sign-in"
          params={{ tenant }}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Back to{' '}
          <span className="text-primary font-medium hover:underline">
            Sign In
          </span>
        </Link>
      </div>
    </>
  )
}
