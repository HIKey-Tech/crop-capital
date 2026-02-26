import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { useTenant } from '@/contexts/tenant'

export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: ({ context }) => {
    // User is guaranteed to exist from parent _authenticated route
    const { user } = context

    // Check if user is admin or super-admin
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      throw redirect({
        to: '/dashboard',
      })
    }

    // Pass user down to child routes
    return { user }
  },
  component: AdminRouteGate,
})

function AdminRouteGate() {
  const { tenant } = useTenant()

  if (!tenant.features.adminPortal) {
    throw redirect({ to: '/dashboard' })
  }

  return <Outlet />
}
