import { createFileRoute } from '@tanstack/react-router'
import { AuthLayout } from '@/components/layout/auth-layout'

export const Route = createFileRoute('/auth')({
  component: AuthLayoutRoute,
})

function AuthLayoutRoute() {
  return <AuthLayout />
}
