import { createFileRoute } from '@tanstack/react-router'

import { AuthLayout } from '@/components/layout/auth-layout'

export const Route = createFileRoute('/$tenant/auth')({
  component: TenantAuthLayoutRoute,
})

function TenantAuthLayoutRoute() {
  return <AuthLayout />
}
