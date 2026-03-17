import { useEffect, useMemo, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  BadgeCheck,
  ChevronRight,
  CircleUserRound,
  ShieldCheck,
  Sprout,
  Target,
} from 'lucide-react'
import { toast } from 'sonner'

import { countries } from '@/components/layout/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTenant } from '@/contexts/tenant'
import { useCurrentUser, useUpdateProfile } from '@/hooks/use-auth'

export const Route = createFileRoute('/$tenant/onboarding')({
  component: OnboardingPage,
})

type OnboardingGoal = 'income' | 'growth' | 'balanced'
type ExperienceLevel = 'first-time' | 'some-experience' | 'advanced'

interface StoredOnboardingState {
  completed: boolean
  goal?: OnboardingGoal
  experience?: ExperienceLevel
  termsAccepted?: boolean
  updatedAt?: string
}

const goalOptions: Array<{
  value: OnboardingGoal
  title: string
  description: string
}> = [
  {
    value: 'income',
    title: 'Short-term cash flow',
    description: 'Focus on quicker visibility and shorter farm cycles.',
  },
  {
    value: 'growth',
    title: 'Long-term upside',
    description: 'Prefer higher return potential over a longer horizon.',
  },
  {
    value: 'balanced',
    title: 'Balanced portfolio',
    description: 'Mix stability and upside across multiple farm projects.',
  },
]

const experienceOptions: Array<{
  value: ExperienceLevel
  title: string
  description: string
}> = [
  {
    value: 'first-time',
    title: 'First-time investor',
    description: 'I want clearer guidance and simpler investment choices.',
  },
  {
    value: 'some-experience',
    title: 'Some experience',
    description: 'I can compare opportunities but still value context.',
  },
  {
    value: 'advanced',
    title: 'Experienced allocator',
    description: 'I want quick access to farms, metrics, and reporting.',
  },
]

const getOnboardingStorageKey = (tenantSlug: string, userId?: string) =>
  `tenant-onboarding:${tenantSlug}:${userId ?? 'guest'}`

function OnboardingPage() {
  const { tenant: tenantParam } = Route.useParams()
  const { tenant } = useTenant()
  const { data: currentUserData, isLoading: isUserLoading } = useCurrentUser()
  const updateProfile = useUpdateProfile()
  const navigate = useNavigate()

  const totalSteps = 3
  const currentUser = currentUserData?.user

  const [step, setStep] = useState(1)
  const [fullName, setFullName] = useState('')
  const [country, setCountry] = useState('')
  const [goal, setGoal] = useState<OnboardingGoal | null>(null)
  const [experience, setExperience] = useState<ExperienceLevel | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const progress = (step / totalSteps) * 100
  const storageKey = useMemo(
    () => getOnboardingStorageKey(tenantParam, currentUser?._id),
    [tenantParam, currentUser?._id],
  )

  useEffect(() => {
    if (!currentUser) return

    setFullName(currentUser.name)
    setCountry(currentUser.country ?? '')

    if (typeof window === 'undefined') return

    const rawState = localStorage.getItem(storageKey)
    if (!rawState) return

    try {
      const savedState = JSON.parse(rawState) as StoredOnboardingState
      setGoal(savedState.goal ?? null)
      setExperience(savedState.experience ?? null)
      setTermsAccepted(Boolean(savedState.termsAccepted))
      setIsCompleted(Boolean(savedState.completed))
    } catch {
      localStorage.removeItem(storageKey)
    }
  }, [currentUser, storageKey])

  const persistDraft = (overrides?: Partial<StoredOnboardingState>) => {
    if (typeof window === 'undefined' || !currentUser) return

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        completed: false,
        goal: goal ?? undefined,
        experience: experience ?? undefined,
        termsAccepted,
        updatedAt: new Date().toISOString(),
        ...overrides,
      } satisfies StoredOnboardingState),
    )
  }

  const finishOnboarding = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          completed: true,
          goal: goal ?? undefined,
          experience: experience ?? undefined,
          termsAccepted: true,
          updatedAt: new Date().toISOString(),
        } satisfies StoredOnboardingState),
      )
    }

    setIsCompleted(true)
    toast.success('Onboarding complete. Your tenant workspace is ready.')
    navigate({
      to: '/$tenant/dashboard',
      params: { tenant: tenantParam },
    })
  }

  const handleNext = async () => {
    if (!currentUser) {
      navigate({ to: '/$tenant/auth/sign-up', params: { tenant: tenantParam } })
      return
    }

    if (step === 1) {
      if (!fullName.trim() || !country.trim()) {
        toast.error('Full name and country are required to continue')
        return
      }

      try {
        await updateProfile.mutateAsync({
          name: fullName.trim(),
          country: country.trim(),
        })
        persistDraft()
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to save your profile details',
        )
        return
      }
    }

    if (step === 2) {
      if (!goal || !experience) {
        toast.error('Choose an investment goal and experience level')
        return
      }

      persistDraft()
    }

    if (step === 3) {
      if (!termsAccepted) {
        toast.error('Accept the tenant terms to finish onboarding')
        return
      }

      finishOnboarding()
      return
    }

    setStep((currentStep) => Math.min(currentStep + 1, totalSteps))
  }

  if (!isUserLoading && !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(180deg,#f8fbf7_0%,#edf5ef_100%)] p-4">
        <div className="w-full max-w-lg rounded-3xl border border-border bg-white p-8 text-center shadow-xl">
          <BadgeCheck className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            Create your tenant account first
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Onboarding for {tenant.displayName} becomes available after you
            create or sign in to your tenant-linked account.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="btn-primary-gradient">
              <Link to="/$tenant/auth/sign-up" params={{ tenant: tenantParam }}>
                Create Account
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/$tenant/auth/sign-in" params={{ tenant: tenantParam }}>
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(180deg,#f8fbf7_0%,#edf5ef_100%)] p-4">
        <div className="w-full max-w-2xl rounded-4xl border border-border bg-white p-8 shadow-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-secondary/20 bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-secondary-foreground">
            <BadgeCheck className="h-3.5 w-3.5" />
            Onboarding Complete
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
            {tenant.displayName} is ready for you
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Your tenant profile and onboarding preferences are saved. Continue
            to the dashboard to explore farms, investments, and updates from{' '}
            {tenant.displayName}.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Profile
              </div>
              <div className="mt-2 font-medium text-foreground">{fullName}</div>
              <div className="text-sm text-muted-foreground">{country}</div>
            </div>
            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Goal
              </div>
              <div className="mt-2 font-medium text-foreground">
                {goalOptions.find((option) => option.value === goal)?.title ??
                  'Not set'}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Experience
              </div>
              <div className="mt-2 font-medium text-foreground">
                {experienceOptions.find((option) => option.value === experience)
                  ?.title ?? 'Not set'}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              className="btn-primary-gradient"
              onClick={() =>
                navigate({
                  to: '/$tenant/dashboard',
                  params: { tenant: tenantParam },
                })
              }
            >
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={() => setIsCompleted(false)}>
              Review onboarding
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbf7_0%,#edf5ef_100%)] p-4">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-4xl border border-border/60 bg-[radial-gradient(circle_at_top_left,rgba(33,134,65,0.14),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,248,243,0.92))] p-8 shadow-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            <Sprout className="h-3.5 w-3.5" />
            Tenant Onboarding
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground">
            {tenant.heroTitle}
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">
            {tenant.heroDescription}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-white/80 p-4 shadow-sm">
              <CircleUserRound className="h-5 w-5 text-primary" />
              <h2 className="mt-3 text-sm font-semibold text-foreground">
                Complete your profile
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Confirm the basics for this tenant-linked account.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-white/80 p-4 shadow-sm">
              <Target className="h-5 w-5 text-primary" />
              <h2 className="mt-3 text-sm font-semibold text-foreground">
                Set your investing intent
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Help {tenant.displayName} match your goals and experience level.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-white/80 p-4 shadow-sm">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h2 className="mt-3 text-sm font-semibold text-foreground">
                Confirm terms
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Accept the {tenant.displayName} rules before entering the
                dashboard.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-white/80 p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              What this changes
            </div>
            <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
              <li>
                1. Your profile stays accurate for this tenant experience.
              </li>
              <li>
                2. Your onboarding preferences are stored for this tenant only.
              </li>
              <li>
                3. You land on the dashboard ready to browse farms and invest
                with {tenant.displayName}.
              </li>
            </ul>
          </div>
        </section>

        <section className="w-full overflow-hidden rounded-4xl border border-border bg-white shadow-xl animate-fade-in">
          <div className="px-8 pt-8 pb-4 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              {step === 1 && <CircleUserRound />}
              {step === 2 && <Sprout />}
              {step === 3 && <ShieldCheck />}
            </div>
            <h1 className="mb-2 text-2xl font-bold tracking-tight">
              {step === 1 && 'Complete your tenant profile'}
              {step === 2 && 'Choose your investing style'}
              {step === 3 && 'Secure your account setup'}
            </h1>
            <p className="text-sm text-muted-foreground">
              Step {step} of {totalSteps}
            </p>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="px-8 py-6">
            {step === 1 && (
              <div className="space-y-4 animate-slide-in-right">
                <div className="space-y-2">
                  <Label htmlFor="onboarding-full-name">Full Name</Label>
                  <Input
                    id="onboarding-full-name"
                    placeholder="e.g. John Doe"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Where are you based?</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                  This step updates your tenant-linked profile using the same
                  account you just created.
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-slide-in-right">
                <p className="text-center text-sm text-muted-foreground">
                  Help {tenant.displayName} shape a more relevant investment
                  experience.
                </p>

                <div className="grid gap-3">
                  {goalOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setGoal(option.value)}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${goal === option.value ? 'border-primary bg-primary/5 shadow-sm' : 'hover:border-primary hover:bg-primary/5'}`}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                        {option.value === 'income'
                          ? '$'
                          : option.value === 'growth'
                            ? '$$'
                            : '~'}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">
                          {option.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="space-y-3 pt-2">
                  <p className="text-sm font-medium text-foreground">
                    How experienced are you with investing?
                  </p>
                  <div className="grid gap-3">
                    {experienceOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setExperience(option.value)}
                        className={`rounded-xl border p-3 text-left transition ${experience === option.value ? 'border-primary bg-primary/5 shadow-sm' : 'hover:border-primary/50 hover:bg-muted/40'}`}
                      >
                        <div className="text-sm font-semibold">
                          {option.title}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-slide-in-right text-center">
                <p className="text-sm text-muted-foreground">
                  Almost done. Review the tenant terms before entering your
                  dashboard.
                </p>
                <div className="h-36 overflow-y-auto rounded-lg border bg-gray-50 p-4 text-left text-xs text-muted-foreground">
                  <p className="mb-1 font-semibold">Terms of Service</p>
                  <p>
                    By using {tenant.displayName}, you agree to operate within
                    the tenant&apos;s published investment rules, disclosure
                    model, and risk statements.
                  </p>
                  <p className="mt-2">
                    1. Agriculture and commodity-linked projects involve
                    execution and weather risk.
                  </p>
                  <p className="mt-2">
                    2. Your access, profile, and investment activity remain
                    scoped to this tenant experience.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="rounded border-gray-300"
                    checked={termsAccepted}
                    onChange={(event) => setTermsAccepted(event.target.checked)}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the Terms and Privacy Policy
                  </Label>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 p-8 pt-0">
            <Button
              onClick={() => void handleNext()}
              className="group h-11 w-full text-base"
              disabled={updateProfile.isPending}
            >
              {step === totalSteps ? 'Get Started' : 'Continue'}
              {step !== totalSteps && (
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              )}
            </Button>

            {step === 1 && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="mx-auto text-xs text-muted-foreground"
              >
                <Link
                  to="/$tenant/auth/sign-in"
                  params={{ tenant: tenantParam }}
                >
                  Skip for now
                </Link>
              </Button>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
