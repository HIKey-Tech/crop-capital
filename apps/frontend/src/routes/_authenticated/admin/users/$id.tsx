import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowLeft,
  DollarSign,
  Mail,
  MapPin,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

import type { Farm, Investment } from '@/types'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/data-table'
import { useUser } from '@/hooks'
import { formatDate } from '@/lib/format-date'
import { formatCurrency } from '@/lib/format-currency'

export const Route = createFileRoute('/_authenticated/admin/users/$id')({
  component: UserDetailsPage,
})

interface InvestmentRow {
  _id: string
  farmName: string
  amount: number
  status: string
  roi: number
  roiPaid: boolean
  createdAt: string
}

const columns: Array<ColumnDef<InvestmentRow>> = [
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
  {
    accessorKey: 'farmName',
    header: 'Farm',
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ getValue }) => (
      <span className="text-foreground font-medium">
        {formatCurrency(Number(getValue()))}
      </span>
    ),
  },
  {
    accessorKey: 'roi',
    header: 'ROI',
    cell: ({ getValue }) => <span>{getValue() as number}%</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const inv = row.original
      if (inv.roiPaid) {
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Completed
          </Badge>
        )
      }
      if (inv.status === 'completed') {
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Active
          </Badge>
        )
      }
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-200"
        >
          Pending
        </Badge>
      )
    },
  },
]

function UserDetailsPage() {
  const { id } = Route.useParams()
  const { data, isLoading, error } = useUser(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (error || !data?.user) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-muted-foreground">User not found</p>
        <Button asChild>
          <Link to="/admin/investors">Back to Investors</Link>
        </Button>
      </div>
    )
  }

  const user = data.user
  const investments = data.investments

  // Transform investments for the table
  const investmentRows: Array<InvestmentRow> = investments.map(
    (inv: Investment) => {
      const farm = inv.farm as Farm
      return {
        _id: inv._id,
        farmName: farm.name || 'Unknown Farm',
        amount: inv.amount,
        status: inv.status,
        roi: inv.roi,
        roiPaid: inv.roiPaid,
        createdAt: inv.createdAt,
      }
    },
  )

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/investors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" /> {user.email}
            </span>
            {user.country && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {user.country}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-card border rounded-xl p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-semibold mb-2">
              <DollarSign className="h-4 w-4" /> Total Invested
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(user.totalInvested)}
            </div>
          </div>
          <div className="bg-card border rounded-xl p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-semibold mb-2">
              <TrendingUp className="h-4 w-4" /> Active Investments
            </div>
            <div className="text-2xl font-bold">{user.activeInvestments}</div>
          </div>
        </div>

        {/* Verification Status */}
        <div className="bg-card border rounded-xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            Account Status
          </h3>
          <div className="text-center py-4">
            <Badge
              className={`text-lg px-4 py-1 hover:bg-current ${
                user.isVerified
                  ? 'bg-green-100 text-green-700 border-green-200'
                  : 'bg-yellow-100 text-yellow-700 border-yellow-200'
              }`}
            >
              {user.isVerified ? 'Verified' : 'Unverified'}
            </Badge>
            <p className="text-sm text-muted-foreground mt-2">
              Member since {formatDate(user.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold">Investment History</h3>
        </div>
        {investmentRows.length > 0 ? (
          <div className="p-4">
            <DataTable
              columns={columns}
              data={investmentRows}
              pageSize={10}
              enableSearch={false}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              This user has no investments yet
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
