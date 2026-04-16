import {
  Outlet,
  createFileRoute,
  isRedirect,
  redirect,
} from '@tanstack/react-router'

import { clearAuthToken, getAuthToken } from '@/lib/api-client'
import { api } from '@/lib/api-builder'

export const Route = createFileRoute('/auth')({
  beforeLoad: async ({ context }) => {
    const token = getAuthToken()
    if (!token) return

    // User is already signed in
    try {
      const response = await context.queryClient.ensureQueryData({
        queryKey: api.auth.me.$use(),
        queryFn: () => api.$use.auth.me(),
        staleTime: 1000 * 60 * 5,
      })

      if (response.user.role === 'super_admin') {
        throw redirect({ to: '/super-admin' })
      }

      clearAuthToken()
    } catch (error) {
      if (isRedirect(error)) throw error

      // Auth check failed — let them proceed to auth page
      clearAuthToken()
    }
  },
  component: PlatformAuthLayout,
})

function PlatformAuthLayout() {
  return <Outlet />
}
