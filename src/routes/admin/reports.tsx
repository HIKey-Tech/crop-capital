import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  Activity,
  Banknote,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  Mail,
  Phone,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCard } from '@/components/dashboard/stats-card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/admin/reports')({
  component: AdminReportsPage,
})

function formatCurrency(num: number) {
  return '₦' + num.toLocaleString('en-NG', { minimumFractionDigits: 0 })
}

const stats = [
  {
    label: 'Total Amount Invested',
    value: formatCurrency(50420000),
    icon: <Banknote className="w-4 h-4 text-primary" />,
    trend: '+5%',
    trendLabel: 'from last month',
  },
  {
    label: 'Total Investors',
    value: '424',
    icon: <Users className="w-4 h-4 text-primary" />,
    trend: '+12',
    trendLabel: 'new this month',
  },
  {
    label: 'Opportunities Created',
    value: '17',
    icon: <ListChecks className="w-4 h-4 text-primary" />,
    trend: '+2',
    trendLabel: 'new this month',
  },
  {
    label: 'Platform Revenue',
    value: formatCurrency(2249000),
    icon: <Activity className="w-4 h-4 text-primary" />,
    trend: '+3%',
    trendLabel: 'from last month',
  },
]

const topInvestorsSeed = [
  {
    id: 1,
    name: 'Bolaji Ibukun',
    email: 'bolaji@domain.com',
    phone: '+234 8011 320 999',
    invested: 9700000,
    projects: 5,
  },
  {
    id: 2,
    name: 'Sarah Knox',
    email: 'sarah@domain.com',
    phone: '+234 9030 444 127',
    invested: 8300000,
    projects: 4,
  },
  {
    id: 3,
    name: 'Adeoye Mutiu',
    email: 'adeoye@domain.com',
    phone: '+234 8125 902 341',
    invested: 7100000,
    projects: 3,
  },
  {
    id: 4,
    name: 'Sarah Akin',
    email: 'sakin@domain.com',
    phone: '+234 8909 934 188',
    invested: 4800000,
    projects: 2,
  },
  {
    id: 5,
    name: 'Yusuf Bola',
    email: 'ybola@domain.com',
    phone: '+234 7012 129 881',
    invested: 3990000,
    projects: 2,
  },
]

const recentActivities = [
  {
    id: 1,
    time: '2024-06-15 09:54',
    type: 'New Investment',
    details: '₦1,200,000 by Sarah Knox (Wheat Rolls Valley)',
    icon: <Banknote className="w-4 h-4 text-green-600" />,
    color: 'bg-green-100',
  },
  {
    id: 2,
    time: '2024-06-14 15:23',
    type: 'ROI Paid',
    details: '₦320,000 to Adeoye Mutiu (Cassava Plantation Co.)',
    icon: <Activity className="w-4 h-4 text-blue-600" />,
    color: 'bg-blue-100',
  },
  {
    id: 3,
    time: '2024-06-13 18:21',
    type: 'New Investor',
    details: 'Chika Eze joined platform',
    icon: <Users className="w-4 h-4 text-primary" />,
    color: 'bg-primary/10',
  },
  {
    id: 4,
    time: '2024-06-13 11:11',
    type: 'Investment Withdrawal',
    details: '₦200,000 withdrawn by Yusuf Bola',
    icon: <TrendingUp className="w-4 h-4 text-yellow-700" />,
    color: 'bg-yellow-100',
  },
]

const PAGE_SIZE = 3

function AdminReportsPage() {
  const [investorSearch, setInvestorSearch] = useState('')
  const [page, setPage] = useState(1)

  const filteredInvestors = topInvestorsSeed.filter((inv) =>
    [inv.name, inv.email, inv.phone]
      .join(' ')
      .toLowerCase()
      .includes(investorSearch.toLowerCase()),
  )

  const totalPages = Math.ceil(filteredInvestors.length / PAGE_SIZE)
  const pagedInvestors = filteredInvestors.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  )

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setInvestorSearch(e.target.value)
    setPage(1)
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="max-w-screen-2xl mx-auto px-4 mb-10 animate-fade-in space-y-8">
        {/* Page header & hierarchy */}
        <header className="pt-6 pb-2 flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Admin » Reports</span>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Reports & Platform Analytics
          </h1>
          <p className="text-base text-muted-foreground">
            Visualize platform performance, key numbers, and leading investors.
          </p>
        </header>

        {/* Stats summary cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              tabIndex={0}
              aria-label={stat.label}
              className="transition ring-primary/15 focus-visible:ring-4 focus-visible:outline-none hover:shadow-md duration-150"
            >
              <StatsCard
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                trend={stat.trend}
                trendLabel={stat.trendLabel}
              />
            </div>
          ))}
        </section>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Top Investors Table with search and pagination */}
          <section className="flex-1 bg-card rounded-xl border border-border overflow-x-auto">
            <header className="px-6 py-4 border-b border-border flex items-center justify-between gap-2 flex-wrap">
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Top Investors
              </h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute left-2 top-2 text-muted-foreground">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone"
                    value={investorSearch}
                    onChange={handleSearch}
                    className="border border-border rounded-lg py-1.5 pl-8 pr-2 text-sm bg-background focus:outline-none focus:border-primary transition w-48"
                    aria-label="Search investors"
                  />
                </div>
              </div>
            </header>
            <Table className="w-full min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-44">Name</TableHead>
                  <TableHead className="w-40">Email</TableHead>
                  <TableHead className="w-32">Phone</TableHead>
                  <TableHead className="w-32 text-center">
                    Total Invested
                  </TableHead>
                  <TableHead className="w-24 text-center">Projects</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedInvestors.length > 0 ? (
                  pagedInvestors.map((inv, idx) => (
                    <TableRow
                      key={inv.id}
                      className={cn(
                        'border-t border-border group transition hover:bg-muted/30',
                        idx % 2 === 1 ? 'bg-muted/10' : '',
                      )}
                    >
                      <TableCell className="font-medium text-foreground flex gap-2 items-center">
                        <span className="rounded bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                          #{inv.id}
                        </span>
                        {inv.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground flex items-center gap-1">
                        <Mail className="w-4 h-4 inline-block text-muted-foreground/60" />
                        <span className="truncate">{inv.email}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground flex items-center gap-1">
                        <Phone className="w-4 h-4 inline-block text-muted-foreground/60" />
                        <span className="truncate">{inv.phone}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        {formatCurrency(inv.invested)}
                      </TableCell>
                      <TableCell className="text-center">
                        {inv.projects}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No investors found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <footer className="px-6 py-3 flex gap-4 items-center justify-end border-t border-border bg-muted/20 rounded-b-xl">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-sm font-semibold border border-border hover:bg-muted transition disabled:opacity-60 disabled:cursor-not-allowed',
                  )}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-sm font-semibold border border-border hover:bg-muted transition disabled:opacity-60 disabled:cursor-not-allowed',
                  )}
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </footer>
            )}
          </section>

          {/* Recent Activity Feed */}
          <section className="w-full max-w-md lg:max-w-xs shrink-0 bg-card rounded-xl border border-border">
            <header className="px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Recent Activity
              </h2>
            </header>
            <ul className="divide-y divide-border">
              {recentActivities.length > 0 ? (
                recentActivities.map((a, idx) => (
                  <li
                    key={a.id}
                    tabIndex={0}
                    className={cn(
                      'px-6 py-4 flex items-start gap-4 group transition hover:bg-muted/30 focus-visible:ring-2 ring-primary/30 focus:outline-none',
                      a.color || '',
                    )}
                    style={{ animation: `slide-up 400ms ${idx * 40}ms both` }}
                  >
                    <span
                      className={cn(
                        'mt-1 shrink-0 rounded-full border border-border p-1.5',
                        a.color || 'bg-muted',
                      )}
                    >
                      {a.icon ? a.icon : <TrendingUp className="w-4 h-4" />}
                    </span>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">
                        {new Date(a.time).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </div>
                      <div className="font-medium text-foreground">
                        {a.type}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {a.details}
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="py-6 text-center text-muted-foreground">
                  No activity to show.
                </li>
              )}
            </ul>
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}
