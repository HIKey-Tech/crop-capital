import { useForm } from '@mantine/form'
import { useMutation } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { zodResolver } from 'mantine-form-zod-resolver'
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  PASSWORD_REQUIREMENTS_HINT,
  resetPasswordSchema,
} from '@/api/auth/schema'
import { api } from '@/lib/api-builder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const Route = createFileRoute('/auth/reset-password')({
  component: PlatformResetPasswordPage,
  validateSearch: z.object({
    token: z.string().catch(''),
  }),
})

function PlatformResetPasswordPage() {
  const { token } = Route.useSearch()
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validate: zodResolver(resetPasswordSchema),
    validateInputOnBlur: true,
    validateInputOnChange: ['password', 'confirmPassword'],
  })

  const passwordInputProps = form.getInputProps('password')
  const confirmPasswordInputProps = form.getInputProps('confirmPassword')

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

  const handleSubmit = form.onSubmit(
    async (values) => {
      if (!token) {
        toast.error('Invalid reset token')
        return
      }

      await resetPasswordMutation.mutateAsync({
        token,
        password: values.password,
      })
    },
    (validationErrors) => {
      const message =
        validationErrors.confirmPassword ||
        validationErrors.password ||
        'Please fix the highlighted fields before continuing'

      toast.error(String(message))
    },
  )

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden border-r border-border bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.24),transparent_34%),linear-gradient(160deg,hsl(var(--card)),hsl(var(--muted))_55%,hsl(var(--card)))] lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-16 right-8 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="relative max-w-xl space-y-8">
          <Link
            to="/"
            className="inline-flex items-center gap-3 rounded-full border border-border/80 bg-background/70 px-4 py-2 backdrop-blur"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                CropCapital
              </p>
              <p className="text-xs text-muted-foreground">
                Platform account recovery
              </p>
            </div>
          </Link>

          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">
              Secure reset
            </p>
            <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-foreground xl:text-5xl">
              Set a new platform operator password.
            </h1>
            <p className="max-w-lg text-base leading-7 text-muted-foreground xl:text-lg">
              Use a strong password to regain access to the operator workspace.
            </p>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md rounded-4xl border border-border bg-card/95 p-6 shadow-xl shadow-primary/5 backdrop-blur sm:p-8">
          {!token ? (
            <>
              <div className="mb-8">
                <h1 className="mb-2 text-3xl font-bold text-foreground">
                  Invalid Reset Link
                </h1>
                <p className="text-muted-foreground">
                  This platform password reset link is invalid or has expired.
                </p>
              </div>
              <Link to="/auth/forgot-password">
                <Button className="w-full">Request New Reset Link</Button>
              </Link>
            </>
          ) : isSuccess ? (
            <>
              <div className="mb-8">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="mb-2 text-3xl font-bold text-foreground">
                  Password Reset Complete!
                </h1>
                <p className="text-muted-foreground">
                  Your platform password has been reset. You can now sign in
                  with your new password.
                </p>
              </div>
              <Link to="/auth">
                <Button className="h-12 w-full btn-primary-gradient">
                  Continue to Sign In
                </Button>
              </Link>
            </>
          ) : (
            <>
              <div className="mb-8">
                <Link
                  to="/auth"
                  className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to Sign In
                </Link>
                <h1 className="mb-2 text-3xl font-bold text-foreground">
                  Reset your password
                </h1>
                <p className="text-muted-foreground">
                  Enter a new password for your platform operator account.
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {form.errors.password && (
                    <p className="mt-1 text-sm text-red-500">
                      {form.errors.password}
                    </p>
                  )}
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {PASSWORD_REQUIREMENTS_HINT}
                  </p>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      {...confirmPasswordInputProps}
                      className="pr-20"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {form.errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">
                      {form.errors.confirmPassword}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="h-12 w-full btn-primary-gradient text-base"
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending
                    ? 'Resetting...'
                    : 'Reset Password'}
                </Button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
