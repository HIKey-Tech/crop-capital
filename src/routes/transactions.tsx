import { createFileRoute } from '@tanstack/react-router'

import { DashboardLayout } from '@/components/layout/dashboard-layout'

export const Route = createFileRoute('/transactions')({
  component: TransactionsPage,
})

function TransactionsPage() {
  const transactions = [
    {
      id: 1,
      type: 'Investment',
      farm: 'Green Palm Trees Farm',
      amount: 5000,
      date: '2024-12-10',
      status: 'completed',
    },
    {
      id: 2,
      type: 'ROI Payout',
      farm: 'Wheat Rolls Valley',
      amount: 750,
      date: '2024-12-05',
      status: 'completed',
    },
    {
      id: 3,
      type: 'Investment',
      farm: 'Cassava Plantation Co.',
      amount: 3000,
      date: '2024-11-28',
      status: 'completed',
    },
    {
      id: 4,
      type: 'Withdrawal',
      farm: '-',
      amount: 1000,
      date: '2024-11-20',
      status: 'completed',
    },
  ]

  return (
    <DashboardLayout userRole="investor">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground">
            View your investment and payout history.
          </p>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                  Type
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                  Farm
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                  Amount
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                  Date
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, index) => (
                <tr
                  key={tx.id}
                  className="border-t border-border animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4 font-medium">{tx.type}</td>
                  <td className="px-6 py-4 text-muted-foreground">{tx.farm}</td>
                  <td className="px-6 py-4">
                    <span
                      className={tx.type === 'ROI Payout' ? 'text-primary' : ''}
                    >
                      {tx.type === 'Withdrawal' ? '-' : '+'}$
                      {tx.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{tx.date}</td>
                  <td className="px-6 py-4">
                    <span className="badge-active capitalize">{tx.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
