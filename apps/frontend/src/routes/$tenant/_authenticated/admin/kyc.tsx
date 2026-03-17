import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { CheckCircle2, Clock, Eye, ShieldCheck, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import type { ColumnDef } from '@tanstack/react-table'

import type { KycSubmission, User } from '@/types'
import { StatsCard } from '@/components/dashboard/stats-card'
import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTenant } from '@/contexts/tenant'
import { useApproveKyc, useKycSubmissions, useRejectKyc } from '@/hooks'
import { formatDate } from '@/lib/format-date'

export const Route = createFileRoute('/$tenant/_authenticated/admin/kyc')({
  component: KYCPage,
})

type KycRow = KycSubmission & {
  user: Pick<User, '_id' | 'name' | 'email' | 'country' | 'photo'>
}

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
] as const

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  passport: 'Passport',
  national_id: 'National ID',
  drivers_license: "Driver's License",
}

function KYCPage() {
  const { tenant } = useTenant()
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedKyc, setSelectedKyc] = useState<KycRow | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  const { data, isLoading } = useKycSubmissions(statusFilter || undefined)
  const approveKyc = useApproveKyc()
  const rejectKyc = useRejectKyc()

  const submissions = (data?.submissions ?? []) as Array<KycRow>
  const stats = data?.stats

  async function handleApprove(id: string) {
    try {
      await approveKyc.mutateAsync(id)
      toast.success('KYC approved successfully')
      setSelectedKyc(null)
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve KYC')
    }
  }

  async function handleReject() {
    if (!selectedKyc || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    try {
      await rejectKyc.mutateAsync({
        id: selectedKyc._id,
        reason: rejectReason,
      })
      toast.success('KYC rejected')
      setShowRejectModal(false)
      setSelectedKyc(null)
      setRejectReason('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject KYC')
    }
  }

  const columns: Array<ColumnDef<KycRow>> = [
    {
      accessorKey: 'user.name',
      header: 'Name',
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.user.name}
        </span>
      ),
    },
    {
      accessorKey: 'user.email',
      header: 'Email',
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.user.email}</span>
      ),
    },
    {
      accessorKey: 'documentType',
      header: 'Document',
      cell: ({ getValue }) => (
        <span>{DOCUMENT_TYPE_LABELS[getValue() as string] ?? getValue()}</span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Submitted',
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">
          {formatDate(getValue() as string)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue() as string
        if (status === 'approved') {
          return (
            <Badge className="border border-green-500 px-2 py-1 text-green-700 bg-green-100/80 rounded-full font-medium text-xs">
              Approved
            </Badge>
          )
        }
        if (status === 'rejected') {
          return (
            <Badge className="border border-red-500 px-2 py-1 text-red-700 bg-red-100/80 rounded-full font-medium text-xs">
              Rejected
            </Badge>
          )
        }
        return (
          <Badge className="border border-yellow-500 px-2 py-1 text-yellow-700 bg-yellow-100/80 rounded-full font-medium text-xs">
            Pending
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedKyc(row.original)}
          className="text-muted-foreground hover:text-foreground"
        >
          <Eye className="w-4 h-4 mr-1" />
          Review
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in max-w-screen-2xl mx-auto px-4 mb-10">
      <header className="pt-3 mb-2 flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">
          {tenant.displayName} admin · KYC
        </span>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          KYC reviews for {tenant.displayName}
        </h1>
        <p className="text-base text-muted-foreground">
          Review and manage investor identity verification submissions for{' '}
          {tenant.displayName}.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          label="Pending Review"
          value={String(stats?.pending ?? 0)}
          icon={<Clock className="w-5 h-5 text-yellow-500" />}
        />
        <StatsCard
          label="Approved"
          value={String(stats?.approved ?? 0)}
          icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
        />
        <StatsCard
          label="Rejected"
          value={String(stats?.rejected ?? 0)}
          icon={<XCircle className="w-5 h-5 text-red-500" />}
        />
        <StatsCard
          label="Total Submissions"
          value={String(stats?.total ?? 0)}
          icon={<ShieldCheck className="w-5 h-5 text-primary" />}
        />
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === filter.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-accent text-muted-foreground hover:text-foreground'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        <DataTable
          columns={columns}
          data={submissions}
          loading={isLoading}
          searchPlaceholder="Search by name or email..."
          pageSize={10}
        />
      </div>

      {/* Review Detail Modal */}
      {selectedKyc && !showRejectModal && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">KYC Review</h2>
                <button
                  onClick={() => setSelectedKyc(null)}
                  className="p-2 hover:bg-accent rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Investor Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Name
                  </p>
                  <p className="font-medium mt-1">{selectedKyc.user.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Email
                  </p>
                  <p className="font-medium mt-1">{selectedKyc.user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Country
                  </p>
                  <p className="font-medium mt-1">
                    {selectedKyc.user.country ?? '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Document Type
                  </p>
                  <p className="font-medium mt-1">
                    {DOCUMENT_TYPE_LABELS[selectedKyc.documentType]}
                  </p>
                </div>
              </div>

              {/* Document Image */}
              <div>
                <p className="text-sm font-medium mb-2">Identity Document</p>
                <div className="border rounded-xl overflow-hidden bg-accent">
                  <img
                    src={selectedKyc.documentImage}
                    alt="Identity document"
                    className="w-full h-64 object-contain"
                  />
                </div>
              </div>

              {/* Selfie Image */}
              {selectedKyc.selfieImage && (
                <div>
                  <p className="text-sm font-medium mb-2">
                    Selfie with Document
                  </p>
                  <div className="border rounded-xl overflow-hidden bg-accent">
                    <img
                      src={selectedKyc.selfieImage}
                      alt="Selfie with document"
                      className="w-full h-64 object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Rejection reason if previously rejected */}
              {selectedKyc.rejectionReason && (
                <div className="p-4 border border-red-200 bg-red-50/50 rounded-xl">
                  <p className="text-sm font-medium text-red-700">
                    Previous Rejection Reason
                  </p>
                  <p className="text-sm text-red-600 mt-1">
                    {selectedKyc.rejectionReason}
                  </p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            {selectedKyc.status === 'pending' && (
              <div className="p-6 border-t flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(true)
                  }}
                  disabled={rejectKyc.isPending}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleApprove(selectedKyc._id)}
                  disabled={approveKyc.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {approveKyc.isPending ? 'Approving...' : 'Approve'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && selectedKyc && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-lg font-bold">Reject KYC Submission</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Provide a reason so the investor can correct and resubmit.
              </p>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Document is blurry, name doesn't match account..."
                rows={4}
                className="w-full border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectReason('')
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={rejectKyc.isPending || !rejectReason.trim()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {rejectKyc.isPending ? 'Rejecting...' : 'Reject Submission'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
