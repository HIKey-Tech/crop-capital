import { createFileRoute, redirect } from '@tanstack/react-router'
import { AdminDashboard } from '@/components/dashboard/admin-dashboard'

export const Route = createFileRoute('/_authenticated/admin/')({
  beforeLoad: () => {
    // Redirect to /dashboard — admin dashboard is now rendered via view mode
    throw redirect({ to: '/dashboard' })
  },
  component: AdminDashboard,
})
