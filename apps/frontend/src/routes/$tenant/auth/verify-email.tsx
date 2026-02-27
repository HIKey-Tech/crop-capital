import { Link, createFileRoute } from '@tanstack/react-router'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/$tenant/auth/verify-email')({
  component: VerifyEmailPage,
})

function VerifyEmailPage() {
  const { tenant } = Route.useParams()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 text-center animate-fade-in">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Check your email</h1>
        <p className="text-muted-foreground mb-8">
          We sent a verification link to{' '}
          <span className="font-semibold text-foreground">
            user@example.com
          </span>
          . Please click the link to verify your account.
        </p>

        <div className="space-y-4">
          <Button className="w-full" variant="outline">
            Resend Email
          </Button>
          <Button variant="link" asChild className="text-sm">
            <Link to="/$tenant/auth/sign-in" params={{ tenant }}>
              Back to Login
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
