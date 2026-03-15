import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'

import { clearAuthToken, getAuthToken } from '@/lib/api-client'
import { api } from '@/lib/api-builder'
import { SuperAdminSidebar } from '@/components/layout/super-admin-sidebar'
import { SuperAdminHeader } from '@/components/layout/super-admin-header'

export const Route = createFileRoute('/super-admin')({
  beforeLoad: async ({ context }) => {
    const token = getAuthToken()

    if (!token) {
      throw redirect({ to: '/auth' })
    }

    try {
      const response = await context.queryClient.ensureQueryData({
        queryKey: api.auth.me.$use(),
        queryFn: () => api.$use.auth.me(),
        staleTime: 1000 * 60 * 5,
      })

      if (response.user.role !== 'super_admin') {
        throw redirect({ to: '/auth' })
      }
    } catch {
      clearAuthToken()
      throw redirect({ to: '/auth' })
    }
  },
  component: SuperAdminLayout,
})

function SuperAdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <SuperAdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-55">
        <SuperAdminHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
