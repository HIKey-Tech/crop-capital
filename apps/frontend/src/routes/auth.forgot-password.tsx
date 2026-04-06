import { useForm } from '@mantine/form'
import { useMutation } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { zodResolver } from 'mantine-form-zod-resolver'
import { ArrowLeft, Mail } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { forgotPasswordSchema } from '@/api/auth/schema'
import { api } from '@/lib/api-builder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const Route = createFileRoute('/auth/forgot-password')({
  component: PlatformForgotPasswordPage,
})

function PlatformForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: zodResolver(forgotPasswordSchema),
  })

  const forgotPasswordMutation = useMutation({
    mutationFn: api.$use.auth.forgotPassword,
    onSuccess: () => {
      toast.success('Password reset link sent to your email!')
      setIsSubmitted(true)
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to send reset link'
      toast.error(message)
    },
  })

  const handleSubmit = form.onSubmit(async () => {
    await forgotPasswordMutation.mutateAsync(form.values.email)
  })

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
              <Mail className="h-5 w-5" />
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
              Recovery access
            </p>
            <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-foreground xl:text-5xl">
              Reset your platform operator password.
            </h1>
            <p className="max-w-lg text-base leading-7 text-muted-foreground xl:text-lg">
              Enter the email tied to your platform-operator account and we will
              send a reset link if it exists.
            </p>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md rounded-4xl border border-border bg-card/95 p-6 shadow-xl shadow-primary/5 backdrop-blur sm:p-8">
          {isSubmitted ? (
            <>
              <div className="mb-8">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <h1 className="mb-2 text-3xl font-bold text-foreground">
                  Check your email
                </h1>
                <p className="text-muted-foreground">
                  We&apos;ve sent a password reset link to{' '}
                  <span className="font-medium text-foreground">
                    {form.values.email}
                  </span>
                  .
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                  <p className="mb-2">
                    <strong className="text-foreground">
                      Didn&apos;t receive the email?
                    </strong>
                  </p>
                  <ul className="list-inside list-disc space-y-1">
                    <li>Check your spam or junk folder</li>
                    <li>Make sure you entered the correct email</li>
                    <li>Wait a few minutes and check again</li>
                  </ul>
                </div>

                <Button
                  onClick={() => setIsSubmitted(false)}
                  variant="outline"
                  className="w-full"
                >
                  Try different email
                </Button>

                <Link to="/auth">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Sign In
                  </Button>
                </Link>
              </div>
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
                  Forgot password?
                </h1>
                <p className="text-muted-foreground">
                  We&apos;ll send reset instructions for your platform operator
                  account.
                </p>
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
                    <Mail className="input-icon h-5 w-5" />
                  </div>
                  {form.errors.email && (
                    <p className="mt-1 text-sm text-red-500">
                      {form.errors.email}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="h-12 w-full btn-primary-gradient text-base"
                  disabled={forgotPasswordMutation.isPending}
                >
                  {forgotPasswordMutation.isPending
                    ? 'Sending...'
                    : 'Send Reset Link'}
                </Button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
