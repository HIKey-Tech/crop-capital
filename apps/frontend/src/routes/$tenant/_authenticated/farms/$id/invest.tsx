import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Check, ChevronLeft, CreditCard, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFarm, useInvest } from '@/hooks'
import { formatCurrency } from '@/lib/format-currency'
import { LoadingSpinner } from '@/components/ui/loading'

export const Route = createFileRoute('/$tenant/_authenticated/farms/$id/invest')({
  component: InvestPage,
})

function InvestPage() {
  const { id } = Route.useParams()
  const { data, isLoading } = useFarm(id)
  const investMutation = useInvest()

  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState<string>('')

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!data?.farm) return <div>Farm not found</div>

  const farm = data.farm
  const investmentAmount = Number(amount)
  const projectedRoi = investmentAmount + investmentAmount * (farm.roi / 100)
  const profit = projectedRoi - investmentAmount

  const handleNext = () => setStep((s) => s + 1)
  const handleBack = () => setStep((s) => s - 1)

  const handleInvest = async () => {
    try {
      const response = await investMutation.mutateAsync({
        farmId: id,
        amount: investmentAmount,
      })

      // Redirect to Paystack payment page
      if (response.authorizationUrl) {
        window.location.href = response.authorizationUrl
      } else {
        toast.error('Payment initialization failed. Please try again.')
      }
    } catch (error: unknown) {
      const err = error as Error
      toast.error(err.message || 'Investment failed. Please try again.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 animate-fade-in px-4">
      {/* Progress Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 -z-10" />
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}
          >
            1
          </div>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}
          >
            2
          </div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Amount</span>
          <span>Confirm & Pay</span>
        </div>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        {step === 1 && (
          <div className="p-6 md:p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Invest in {farm.name}</h2>
              <p className="text-muted-foreground">
                Minimum investment: {formatCurrency(farm.minimumInvestment)}
              </p>
            </div>

            <div className="space-y-4">
              <Label>Investment Amount (₦)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg py-6"
                min={farm.minimumInvestment}
              />
              <div className="grid grid-cols-3 gap-3">
                {[50000, 100000, 500000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setAmount(val.toString())}
                    className="py-2 px-3 border rounded-lg text-sm font-medium hover:bg-green-50 hover:border-green-200 transition"
                  >
                    {formatCurrency(val)}
                  </button>
                ))}
              </div>
            </div>

            {investmentAmount > 0 && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Projected Return Interest ({farm.roi}%)
                  </span>
                  <span className="font-semibold text-green-700">
                    +{formatCurrency(profit)}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-3 border-t border-green-200">
                  <span className="font-semibold text-green-900">
                    Total Payout
                  </span>
                  <span className="font-bold text-green-700">
                    {formatCurrency(projectedRoi)}
                  </span>
                </div>
                <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <ShieldCheck className="h-3 w-3" /> Secure investment covered
                  by insurance
                </div>
              </div>
            )}

            <Button
              onClick={handleNext}
              className="w-full h-12 text-base"
              disabled={
                !investmentAmount || investmentAmount < farm.minimumInvestment
              }
            >
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-xl font-bold">Confirm Investment</h2>
            </div>

            {/* Payment via Paystack */}
            <div className="p-4 border rounded-xl bg-blue-50 border-blue-200">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Secure Payment</div>
                  <div className="text-sm text-muted-foreground">
                    Process securely via Paystack
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Summary */}
            <div className="bg-gray-50 border rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Farm</span>
                <span className="font-medium">{farm.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Investment Amount</span>
                <span className="font-medium">
                  {formatCurrency(investmentAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ROI Rate</span>
                <span className="font-medium">{farm.roi}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">
                  {farm.durationMonths} months
                </span>
              </div>
              <div className="flex justify-between text-sm pt-3 border-t">
                <span className="font-semibold">Projected Payout</span>
                <span className="font-bold text-green-700">
                  {formatCurrency(projectedRoi)}
                </span>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <Button
                onClick={handleInvest}
                className="w-full h-12 text-base"
                disabled={investMutation.isPending}
              >
                {investMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner className="h-4 w-4" /> Processing...
                  </span>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" /> Pay{' '}
                    {formatCurrency(investmentAmount)}
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                You will be redirected to Paystack to complete payment
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
