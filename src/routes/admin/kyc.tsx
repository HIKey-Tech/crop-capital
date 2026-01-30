import { createFileRoute } from '@tanstack/react-router'
import { ShieldCheck } from 'lucide-react'

import { DashboardLayout } from '@/components/layout/dashboard-layout'

export const Route = createFileRoute('/admin/kyc')({
  component: KYCPage,
})

function KYCPage() {
  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6 animate-fade-in max-w-screen-2xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold">KYC Reviews</h1>
          <p className="text-muted-foreground">
            Identity verification management
          </p>
        </div>

        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="flex flex-col items-center justify-center py-24">
            <ShieldCheck className="h-16 w-16 text-muted-foreground/30 mb-6" />
            <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
            <p className="text-muted-foreground text-center max-w-md">
              KYC verification is currently being developed. Investors will soon
              be able to submit identity documents for verification.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
