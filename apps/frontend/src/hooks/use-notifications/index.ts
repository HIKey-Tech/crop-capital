import { useCallback, useMemo, useState } from 'react'
import type { Farm, Investment } from '@/types'
import { useMyInvestments } from '@/hooks/use-investments'
import { formatCurrency } from '@/lib/format-currency'

const READ_KEY = 'crop-capital:read-notifications'

function getReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_KEY)
    return raw ? new Set(JSON.parse(raw) as Array<string>) : new Set()
  } catch {
    return new Set()
  }
}

function persistReadIds(ids: Set<string>) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(Array.from(ids)))
  } catch {
    // storage unavailable — degrade silently
  }
}

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
  const [readIds, setReadIds] = useState<Set<string>>(getReadIds)

  const notifications = useMemo(() => {
    if (!data?.investments) return []

    const notifs: Array<Notification> = data.investments.flatMap(
      (inv: Investment) => {
        const farm = inv.farm as Farm
        const currency = inv.currency
        const result: Array<Notification> = []

        // Investment created notification
        if (inv.status === 'pending') {
          result.push({
            id: `${inv._id}-pending`,
            type: 'investment',
            title: 'Investment Pending',
            message: `Your investment of ${formatCurrency(inv.amount, currency)} in ${farm.name || 'a farm'} is awaiting payment confirmation.`,
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
            message: `Your investment of ${formatCurrency(inv.amount, currency)} in ${farm.name || 'a farm'} has been confirmed.`,
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
            title: 'Return Paid to Bank',
            message: `${formatCurrency(roiAmount, currency)} in returns from ${farm.name || 'your investment'} has been sent for direct bank payout.`,
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

  const markAllAsRead = useCallback(() => {
    const next = new Set(notifications.map((n) => n.id))
    persistReadIds(next)
    setReadIds(next)
  }, [notifications])

  const unreadCount = useMemo(
    () => notifications.filter((n) => !readIds.has(n.id)).length,
    [notifications, readIds],
  )

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    markAllAsRead,
  }
}
