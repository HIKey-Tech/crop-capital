import { useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { Eye, EyeOff, Mail, User } from 'lucide-react'
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
import { countries } from '@/components/layout/auth-layout'
import { useRegister } from '@/hooks/use-auth'
import { registerSchema } from '@/api/auth/schema'
import { useTenant } from '@/contexts/tenant'

export const Route = createFileRoute('/auth/sign-up/')({
  component: SignUpPage,
})

function SignUpPage() {
  const { mutate: register, isPending } = useRegister()
  const { tenant } = useTenant()
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      country: '',
    },
    validate: zodResolver(registerSchema),
  })

  const handleSubmit = form.onSubmit((values) => {
    register(
      {
        name: values.name,
        email: values.email,
        password: values.password,
        country: values.country,
      },
      {
        onSuccess: () => {
          toast.success('Account created successfully!')
          navigate({ to: '/dashboard' })
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Failed to create account')
        },
      },
    )
  })

  return (
    <>
      <div className="mb-8">
        <p className="text-muted-foreground mb-1">
          Create your account to start investing in agriculture.
        </p>
        <h1 className="text-3xl font-bold text-foreground">
          Sign Up to <span className="text-primary">{tenant.shortName}</span>
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <div className="relative mt-1.5">
            <Input
              id="name"
              placeholder="Enter your full name"
              {...form.getInputProps('name')}
              className="pr-10"
            />
            <User className="input-icon w-5 h-5" />
          </div>
          {form.errors.name && (
            <p className="text-sm text-red-500 mt-1">{form.errors.name}</p>
          )}
        </div>

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
          <Label htmlFor="password">Password</Label>
          <div className="relative mt-1.5">
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

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative mt-1.5">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
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

        <div>
          <Label htmlFor="country">Country</Label>
          <Select
            value={form.getInputProps('country').value}
            onValueChange={(value) => form.setFieldValue('country', value)}
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
          {form.errors.country && (
            <p className="text-sm text-red-500 mt-1">{form.errors.country}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full btn-primary-gradient h-12 text-base"
          disabled={isPending}
        >
          {isPending ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <p className="text-center text-muted-foreground mt-6">
        Already have an account?{' '}
        <Link
          to="/auth/sign-in"
          className="text-primary font-medium hover:underline"
        >
          Sign In
        </Link>
      </p>
    </>
  )
}
