import { createFileRoute, isRedirect, redirect } from '@tanstack/react-router'
import { clearAuthToken, getAuthToken } from '@/lib/api-client'
import { api } from '@/lib/api-builder'
import { AuthLayout } from '@/components/layout/auth-layout'

export const Route = createFileRoute('/auth')({
  beforeLoad: async ({ context }) => {
    const token = getAuthToken()
    if (!token) return

    // User is already signed in — redirect to their dashboard
    try {
      await context.queryClient.ensureQueryData({
        queryKey: api.auth.me.$use(),
        queryFn: () => api.$use.auth.me(),
        staleTime: 1000 * 60 * 5,
      })

      throw redirect({ to: '/dashboard' })
    } catch (error) {
      if (isRedirect(error)) throw error

      // Auth check failed — let them proceed to auth pages
      clearAuthToken()
    }
  },
  component: AuthLayoutRoute,
})

function AuthLayoutRoute() {
  return <AuthLayout />
}
