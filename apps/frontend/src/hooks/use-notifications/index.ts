import { useMemo } from 'react'
import type { Farm, Investment } from '@/types'
import { useMyInvestments } from '@/hooks/use-investments'
import { formatCurrency } from '@/lib/format-currency'

export interface Notification {
  id: string
  type: 'investment' | 'payout' | 'milestone'
  title: string
  message: string
  date: string
  investmentId?: string
}

export function useNotifications() {
  const { data, isLoading, error } = useMyInvestments()

  const notifications = useMemo(() => {
    if (!data?.investments) return []

    const notifs: Array<Notification> = data.investments.flatMap(
      (inv: Investment) => {
        const farm = inv.farm as Farm
        const result: Array<Notification> = []

        // Investment created notification
        if (inv.status === 'pending') {
          result.push({
            id: `${inv._id}-pending`,
            type: 'investment',
            title: 'Investment Pending',
            message: `Your investment of ${formatCurrency(inv.amount)} in ${farm.name || 'a farm'} is awaiting payment confirmation.`,
            date: inv.createdAt,
            investmentId: inv._id,
          })
        }

        // Investment confirmed notification
        if (inv.status === 'completed') {
          result.push({
            id: `${inv._id}-confirmed`,
            type: 'investment',
            title: 'Investment Confirmed',
            message: `Your investment of ${formatCurrency(inv.amount)} in ${farm.name || 'a farm'} has been confirmed.`,
            date: inv.updatedAt,
            investmentId: inv._id,
          })
        }

        // ROI payout notification
        if (inv.roiPaid) {
          const roiAmount = inv.projectedReturn
            ? inv.projectedReturn - inv.amount
            : inv.amount * (inv.roi / 100)
          result.push({
            id: `${inv._id}-payout`,
            type: 'payout',
            title: 'ROI Payout Received',
            message: `You have received ${formatCurrency(roiAmount)} returns from ${farm.name || 'your investment'}.`,
            date: inv.updatedAt,
            investmentId: inv._id,
          })
        }

        return result
      },
    )

    // Sort by date (newest first)
    notifs.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )

    return notifs
  }, [data])

  return {
    notifications,
    isLoading,
    error,
    unreadCount: notifications.length,
  }
}
