import { createFileRoute } from '@tanstack/react-router'

import { useViewMode } from '@/contexts/view-mode'
import { AdminDashboard } from '@/components/dashboard/admin-dashboard'
import { InvestorDashboard } from '@/components/dashboard/investor-dashboard'

export const Route = createFileRoute('/_authenticated/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  const { viewMode } = useViewMode()

  if (viewMode === 'admin') return <AdminDashboard />
  return <InvestorDashboard />
}
