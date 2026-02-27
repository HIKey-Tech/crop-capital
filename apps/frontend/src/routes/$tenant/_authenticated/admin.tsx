import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { useTenant } from '@/contexts/tenant'

export const Route = createFileRoute('/$tenant/_authenticated/admin')({
  beforeLoad: ({ context, params }) => {
    // User is guaranteed to exist from parent _authenticated route
    const { user } = context

    // Tenant admin routes are only for tenant admins
    if (user.role !== 'admin') {
      throw redirect({
        to: '/$tenant/dashboard',
        params: { tenant: params.tenant },
      })
    }

    // Pass user down to child routes
    return { user }
  },
  component: AdminRouteGate,
})

function AdminRouteGate() {
  const { tenant: tenantParam } = Route.useParams()
  const { tenant } = useTenant()

  if (!tenant.features.adminPortal) {
    throw redirect({
      to: '/$tenant/dashboard',
      params: { tenant: tenantParam },
    })
  }

  return <Outlet />
}
