import { createFileRoute } from '@tanstack/react-router'
import { useTenant } from '@/contexts/tenant'

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
})

function PrivacyPage() {
  const { tenant } = useTenant()

  return (
    <div className="max-w-4xl mx-auto py-8 animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: January 2025</p>
      </div>

      <div className="prose max-w-none text-foreground/90">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            1. Information We Collect
          </h2>
          <p>
            {tenant.displayName} collects personal information that you provide
            to us such as name, email address, phone number, and payment
            information...
          </p>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-xl font-semibold text-foreground">
            2. How We Use Your Information
          </h2>
          <p>
            We use your information to facilitate investments, comply with legal
            obligations (KYC/AML), and improve our services...
          </p>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-xl font-semibold text-foreground">
            3. Data Security
          </h2>
          <p>
            We implement appropriate technical and organizational measures to
            protect your personal data...
          </p>
        </section>
      </div>
    </div>
  )
}
