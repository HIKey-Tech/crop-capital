import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { CheckCircle, Loader2, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useVerifyPayment } from '@/hooks'

interface PaymentCallbackSearch {
  reference?: string
  trxref?: string
}

export const Route = createFileRoute(
  '/$tenant/_authenticated/payment/callback',
)({
  validateSearch: (search: Record<string, unknown>): PaymentCallbackSearch => {
    return {
      reference:
        typeof search.reference === 'string' ? search.reference : undefined,
      trxref: typeof search.trxref === 'string' ? search.trxref : undefined,
    }
  },
  component: PaymentCallbackPage,
})

type PaymentStatus = 'verifying' | 'success' | 'failed'

function PaymentCallbackPage() {
  const { tenant } = Route.useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<PaymentStatus>('verifying')
  const verifyPayment = useVerifyPayment()

  const search = Route.useSearch()
  const reference = search.reference
  const trxref = search.trxref // Paystack sometimes uses trxref

  useEffect(() => {
    const paymentReference = reference || trxref

    if (!paymentReference) {
      setStatus('failed')
      return
    }

    verifyPayment.mutate(paymentReference, {
      onSuccess: () => {
        setStatus('success')
      },
      onError: () => {
        setStatus('failed')
      },
    })
  }, [reference, trxref])

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">
            Verifying Payment...
          </h1>
          <p className="text-muted-foreground">
            Please wait while we confirm your payment.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-secondary/20 bg-secondary/10">
            <CheckCircle className="h-12 w-12 text-secondary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Payment Successful!
          </h1>
          <p className="text-muted-foreground">
            Your investment has been confirmed. You can track its progress in
            your investments dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() =>
                navigate({ to: '/$tenant/investments', params: { tenant } })
              }
              className="btn-primary-gradient"
            >
              View My Investments
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                navigate({ to: '/$tenant/farms', params: { tenant } })
              }
            >
              Explore More Farms
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Payment Failed</h1>
        <p className="text-muted-foreground">
          We couldn&apos;t verify your payment. This might be due to a temporary
          issue. Please try again or contact support if the problem persists.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() =>
              navigate({ to: '/$tenant/farms', params: { tenant } })
            }
            className="btn-primary-gradient"
          >
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              navigate({ to: '/$tenant/dashboard', params: { tenant } })
            }
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
