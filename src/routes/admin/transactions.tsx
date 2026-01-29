import { createFileRoute } from '@tanstack/react-router'

import { DashboardLayout } from '@/components/layout/dashboard-layout'

export const Route = createFileRoute('/admin/transactions')({
  component: AdminTransactionsPage,
})

function AdminTransactionsPage() {
  const transactions = [
    {
      id: 1,
      user: 'Bolaji Ibukun',
      type: 'Investment',
      farm: 'Green Palm Trees Farm',
      amount: 5000,
      date: '2024-12-10',
      status: 'completed',
    },
    {
      id: 2,
      user: 'Sarah Knox',
      type: 'ROI Payout',
      farm: 'Wheat Rolls Valley',
      amount: 750,
      date: '2024-12-05',
      status: 'completed',
    },
    {
      id: 3,
      user: 'Adeoye Mutiu',
      type: 'Investment',
      farm: 'Cassava Plantation Co.',
      amount: 3000,
      date: '2024-11-28',
      status: 'completed',
    },
    {
      id: 4,
      user: 'Yusuf Bola',
      type: 'Withdrawal',
      farm: '-',
      amount: 1000,
      date: '2024-11-20',
      status: 'completed',
    },
  ]

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-8 animate-fade-in max-w-screen-2xl mx-auto px-4 mb-10">
        {/* Page hierarchy */}
        <header className="pt-3 mb-2 flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            All Platform Transactions
          </h1>
          <p className="text-base text-muted-foreground">
            Monitor all transactions including investments, payouts, and
            withdrawals made by users.
          </p>
        </header>

        {/* Filter/Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col">
              <label
                htmlFor="date-from"
                className="text-xs text-muted-foreground mb-1"
              >
                Date from
              </label>
              <input
                className="border border-border rounded-lg px-3 py-2 bg-card text-sm focus:outline-none focus:border-primary min-w-[150px]"
                type="date"
                id="date-from"
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="date-to"
                className="text-xs text-muted-foreground mb-1"
              >
                Date to
              </label>
              <input
                className="border border-border rounded-lg px-3 py-2 bg-card text-sm focus:outline-none focus:border-primary min-w-[150px]"
                type="date"
                id="date-to"
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="user"
                className="text-xs text-muted-foreground mb-1"
              >
                User
              </label>
              <input
                className="border border-border rounded-lg px-3 py-2 bg-card text-sm focus:outline-none focus:border-primary min-w-[150px]"
                type="text"
                id="user"
                placeholder="Search by user name"
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="type"
                className="text-xs text-muted-foreground mb-1"
              >
                Type
              </label>
              <select
                className="border border-border rounded-lg px-3 py-2 bg-card text-sm focus:outline-none focus:border-primary min-w-[120px]"
                id="type"
              >
                <option value="">All</option>
                <option value="Investment">Investment</option>
                <option value="ROI Payout">ROI Payout</option>
                <option value="Withdrawal">Withdrawal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <section className="bg-card rounded-xl border border-border overflow-x-auto">
          <header className="px-6 py-3 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              Transactions Overview
            </h2>
          </header>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/90">
                <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Farm
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-muted-foreground"
                  >
                    No transactions found for selected filters.
                  </td>
                </tr>
              ) : (
                transactions.map((tx, index) => (
                  <tr
                    key={tx.id}
                    className="border-t border-border animate-slide-up"
                    style={{ animationDelay: `${index * 35}ms` }}
                  >
                    <td className="px-6 py-4 text-muted-foreground font-medium whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                      {tx.user}
                    </td>
                    <td className="px-6 py-4 font-medium whitespace-nowrap">
                      <span
                        className={
                          tx.type === 'Investment'
                            ? 'px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-semibold'
                            : tx.type === 'ROI Payout'
                              ? 'px-3 py-1 rounded-full bg-blue-100 text-primary border border-blue-300 text-xs font-semibold'
                              : 'px-3 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-300 text-xs font-semibold'
                        }
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {tx.farm}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">
                      <span
                        className={
                          tx.type === 'ROI Payout'
                            ? 'text-primary'
                            : tx.type === 'Withdrawal'
                              ? 'text-orange-700'
                              : 'text-emerald-700'
                        }
                      >
                        {tx.type === 'Withdrawal' ? '-' : '+'}$
                        {tx.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={
                          tx.status === 'completed'
                            ? 'px-2.5 py-1 rounded-full border border-green-500 bg-green-100/80 text-green-700 text-xs font-medium uppercase'
                            : 'px-2.5 py-1 rounded-full border border-zinc-400 bg-zinc-100/80 text-zinc-700 text-xs font-medium uppercase'
                        }
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>
    </DashboardLayout>
  )
}
