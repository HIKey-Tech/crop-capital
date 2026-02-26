import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, Mail } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { forgotPasswordSchema } from '@/api/auth/schema'
import { authApi } from '@/lib/api-client'

export const Route = createFileRoute('/auth/forgot-password/')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: zodResolver(forgotPasswordSchema),
  })

  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
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

  if (isSubmitted) {
    return (
      <>
        <div className="mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Check your email
          </h1>
          <p className="text-muted-foreground">
            We&apos;ve sent a password reset link to{' '}
            <span className="font-medium text-foreground">
              {form.values.email}
            </span>
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p className="mb-2">
              <strong className="text-foreground">
                Didn&apos;t receive the email?
              </strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
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

          <Link to="/auth/sign-in">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Button>
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="mb-8">
        <Link
          to="/auth/sign-in"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Sign In
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Forgot password?
        </h1>
        <p className="text-muted-foreground">
          No worries, we&apos;ll send you reset instructions.
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
            <Mail className="input-icon w-5 h-5" />
          </div>
          {form.errors.email && (
            <p className="text-sm text-red-500 mt-1">{form.errors.email}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full btn-primary-gradient h-12 text-base"
          disabled={forgotPasswordMutation.isPending}
        >
          {forgotPasswordMutation.isPending ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/auth/sign-in"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Remember your password?{' '}
          <span className="text-primary font-medium hover:underline">
            Sign In
          </span>
        </Link>
      </div>
    </>
  )
}
