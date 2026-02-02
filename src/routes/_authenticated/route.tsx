import {
  Outlet,
  createFileRoute,
  isRedirect,
  redirect,
} from '@tanstack/react-router'
import { useState } from 'react'
import { authApi, getAuthToken } from '@/lib/api-client'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { authKeys } from '@/hooks/use-auth'

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
        queryKey: authKeys.me(),
        queryFn: () => authApi.getMe(),
        staleTime: 1000 * 60 * 5, // 5 minutes
      })
      return { user: response.user }
    } catch (error) {
      // Re-throw redirects (they're intentional, not errors)
      if (isRedirect(error)) throw error

      // Auth check failed (network error, token invalid, etc.) - redirect to login
      authApi.logout()
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
  const userRole = user.role

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        userRole={userRole}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-55">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
