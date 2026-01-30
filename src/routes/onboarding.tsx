import { useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChevronRight, ShieldCheck, Sprout, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const Route = createFileRoute('/onboarding')({
    component: OnboardingPage,
})

function OnboardingPage() {
    const [step, setStep] = useState(1)
    const navigate = useNavigate()

    const totalSteps = 3
    const progress = (step / totalSteps) * 100

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1)
        } else {
            navigate({ to: '/dashboard' })
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="px-8 pt-8 pb-4 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                        {step === 1 && <User />}
                        {step === 2 && <Sprout />}
                        {step === 3 && <ShieldCheck />}
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight mb-2">
                        {step === 1 && "Start your journey"}
                        {step === 2 && "Investment Goals"}
                        {step === 3 && "Secure your account"}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Step {step} of {totalSteps}
                    </p>
                    <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                {/* Content Scroller */}
                <div className="px-8 py-6">
                    {step === 1 && (
                        <div className="space-y-4 animate-slide-in-right">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input placeholder="e.g. John Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone Number</Label>
                                <Input placeholder="+234..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Where are you based?</Label>
                                <Input placeholder="City, Country" />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-slide-in-right">
                            <p className="text-sm text-muted-foreground text-center">
                                Help us recommend the best farm projects for you.
                            </p>
                            <div className="grid gap-3">
                                <button className="flex items-center gap-3 p-3 border rounded-xl hover:border-green-500 hover:bg-green-50 transition text-left">
                                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">$</div>
                                    <div>
                                        <div className="font-semibold text-sm">Short term returns</div>
                                        <div className="text-xs text-muted-foreground">3 - 6 months duration</div>
                                    </div>
                                </button>
                                <button className="flex items-center gap-3 p-3 border rounded-xl hover:border-green-500 hover:bg-green-50 transition text-left">
                                    <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">$$</div>
                                    <div>
                                        <div className="font-semibold text-sm">Maximize profit</div>
                                        <div className="text-xs text-muted-foreground">High ROI, 12+ months</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-slide-in-right text-center">
                            <p className="text-sm text-muted-foreground">
                                Almost done! Please review our terms before proceeding to your dashboard.
                            </p>
                            <div className="bg-gray-50 p-4 rounded-lg text-left text-xs text-muted-foreground h-32 overflow-y-auto border">
                                <p className="font-semibold mb-1">Terms of Service</p>
                                <p>By using AYF Agro, you agree to...</p>
                                <p className="mt-2">1. Investment Risks: Agriculture involves risks...</p>
                            </div>
                            <div className="flex items-center gap-2 justify-center">
                                <input type="checkbox" id="terms" className="rounded border-gray-300" />
                                <Label htmlFor="terms" className="text-sm">I agree to the Terms & Privacy Policy</Label>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 pt-0 flex flex-col gap-3">
                    <Button onClick={handleNext} className="w-full h-11 text-base group">
                        {step === totalSteps ? 'Get Started' : 'Continue'}
                        {step !== totalSteps && <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                    </Button>
                    {step === 1 && (
                        <Button variant="ghost" size="sm" asChild className="mx-auto text-xs text-muted-foreground">
                            <Link to="/dashboard">Skip for now</Link>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
