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

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location, context }) => {
    const token = getAuthToken()

    if (!token) {
      throw redirect({
        to: '/auth/sign-in',
        search: {
          redirect: location.href,
        },
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

      // Redirect to dashboard if accessing root
      if (location.pathname === '/') {
        throw redirect({ to: '/dashboard' })
      }

      return { user }
    } catch (error) {
      // Re-throw redirects (they're intentional, not errors)
      if (isRedirect(error)) throw error

      // Auth check failed (network error, token invalid, etc.) - redirect to login
      clearAuthToken()
      throw redirect({
        to: '/auth/sign-in',
        search: {
          redirect: location.href,
        },
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
