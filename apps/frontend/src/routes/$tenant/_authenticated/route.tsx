import {
  Outlet,
  createFileRoute,
  isRedirect,
  redirect,
} from '@tanstack/react-router'
import { useState } from 'react'
import { clearAuthToken, getAuthToken } from '@/lib/api-client'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { ViewModeProvider } from '@/contexts/view-mode'
import { api } from '@/lib/api-builder'
import { useTenant } from '@/contexts/tenant'

export const Route = createFileRoute('/$tenant/_authenticated')({
  beforeLoad: async ({ location, context, params }) => {
    const token = getAuthToken()

    if (!token) {
      throw redirect({
        to: '/$tenant/auth/sign-in',
        params: { tenant: params.tenant },
      })
    }

    // Use ensureQueryData to leverage React Query cache
    try {
      const response = await context.queryClient.ensureQueryData({
        queryKey: api.auth.me.$use(),
        queryFn: () => api.$use.auth.me(),
        staleTime: 1000 * 60 * 5, // 5 minutes
      })

      const user = response.user

      if (user.role === 'super_admin') {
        throw redirect({ to: '/super-admin' })
      }

      // Redirect to dashboard if accessing root
      if (location.pathname === `/${params.tenant}`) {
        throw redirect({
          to: '/$tenant/dashboard',
          params: { tenant: params.tenant },
        })
      }

      return { user }
    } catch (error) {
      // Re-throw redirects (they're intentional, not errors)
      if (isRedirect(error)) throw error

      // Auth check failed (network error, token invalid, etc.) - redirect to login
      clearAuthToken()
      throw redirect({
        to: '/$tenant/auth/sign-in',
        params: { tenant: params.tenant },
      })
    }
  },
  component: AuthenticatedLayout,
})

export function AuthenticatedLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = Route.useRouteContext()
  const { tenant } = useTenant()

  return (
    <ViewModeProvider
      userRole={user.role}
      allowAdminView={tenant.features.adminPortal}
    >
      <div className="min-h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="lg:pl-55">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </ViewModeProvider>
  )
}
