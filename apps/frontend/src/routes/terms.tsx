import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, FileText } from 'lucide-react'

export const Route = createFileRoute('/terms')({
  component: TermsPage,
})

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or using the CropCapital platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree to these terms, you may not use the platform. These terms apply to all operators, administrators, and users of the CropCapital infrastructure.',
  },
  {
    title: '2. Platform Access & Operator Accounts',
    body: 'Access to CropCapital is granted on a subscription basis to approved operators. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized access or security breach.',
  },
  {
    title: '3. Permitted Use',
    body: 'The CropCapital platform is provided for lawful agricultural investment infrastructure purposes only. You may not use the platform to engage in fraudulent activity, violate any applicable law, infringe third-party rights, or attempt to gain unauthorized access to any system or data.',
  },
  {
    title: '4. Tenant Operations & Responsibilities',
    body: 'As a platform operator, you are responsible for the lawful operation of your tenant(s), including compliance with KYC/AML regulations in your jurisdiction, appropriate investor disclosure, and accurate representation of investment products offered through your branded portal.',
  },
  {
    title: '5. Data & Privacy',
    body: 'Your use of the platform is also governed by our Privacy Policy. You represent that you have obtained all necessary consents from your end users to process their data through the CropCapital infrastructure. See our Privacy Policy for full details on data handling.',
  },
  {
    title: '6. Intellectual Property',
    body: 'The CropCapital platform, including all software, design, content, and infrastructure, is proprietary to CropCapital Global Infrastructure. You are granted a limited, non-exclusive, non-transferable license to use the platform solely for your authorized operator purposes.',
  },
  {
    title: '7. Service Availability & SLAs',
    body: 'We strive to maintain 99.9% platform uptime as documented in your operator agreement. Scheduled maintenance will be communicated in advance. CropCapital is not liable for downtime caused by factors outside our reasonable control, including third-party infrastructure failures.',
  },
  {
    title: '8. Payment & Billing',
    body: 'Subscription fees are due as specified in your operator agreement. Failure to pay may result in suspension of your tenant(s). All fees are non-refundable unless otherwise specified. Pricing is subject to change with 30 days notice to registered operators.',
  },
  {
    title: '9. Limitation of Liability',
    body: 'To the maximum extent permitted by law, CropCapital shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform. Our total liability shall not exceed the fees paid by you in the 12 months preceding the claim.',
  },
  {
    title: '10. Termination',
    body: 'Either party may terminate the operator agreement with 30 days written notice. CropCapital may suspend or terminate access immediately in cases of material breach, fraudulent activity, or failure to comply with regulatory requirements. Upon termination, you have 30 days to export your data.',
  },
  {
    title: '11. Governing Law',
    body: 'These Terms are governed by applicable laws. Any disputes arising from these terms shall be subject to binding arbitration before being escalated to courts of competent jurisdiction. You waive the right to participate in class action lawsuits.',
  },
  {
    title: '12. Changes to Terms',
    body: 'We may modify these Terms at any time. Material changes will be communicated to registered operators with at least 14 days notice. Continued use of the platform after the effective date of changes constitutes acceptance of the updated Terms.',
  },
]

function TermsPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-2xl border-b border-border py-5 px-8">
        <div className="premium-container flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[11px] font-black uppercase tracking-[0.35em]">Back to Platform</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black text-xs">CC</span>
            </div>
            <span className="text-sm font-black uppercase tracking-[0.2em] text-foreground">CropCapital</span>
          </div>
        </div>
      </nav>

      <div className="pt-28 pb-32">
        <div className="bg-secondary relative overflow-hidden py-20 lg:py-28 mb-0">
          <div className="absolute inset-0 dot-grid opacity-5" />
          <div className="premium-container relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-white/15 w-10" />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40">Legal Document</span>
            </div>
            <h1 className="text-display text-[clamp(3rem,6vw,7rem)] text-secondary-foreground mb-4">Terms of Service</h1>
            <p className="text-base font-bold text-secondary-foreground/40 uppercase tracking-[0.25em]">Last updated: March 2026</p>
          </div>
        </div>

        <div className="premium-container max-w-4xl mx-auto pt-16">
          <div className="mb-12 p-8 border border-border bg-primary/[0.025] flex gap-5">
            <FileText className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-lg text-muted-foreground leading-relaxed font-medium">
              These Terms of Service govern your access to and use of the CropCapital operator platform. Please read them carefully before accessing the platform. By using CropCapital, you agree to be bound by these terms.
            </p>
          </div>

          <div className="space-y-12">
            {sections.map((section, i) => (
              <div key={i} className="border-b border-border pb-12 last:border-b-0">
                <h2 className="text-2xl lg:text-3xl font-black text-foreground mb-5 uppercase tracking-tight">{section.title}</h2>
                <p className="text-lg text-muted-foreground leading-relaxed font-medium">{section.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 pt-16 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">
              © {new Date().getFullYear()} CropCapital Global Infrastructure
            </p>
            <div className="flex gap-8">
              <a href="/privacy" className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
              <a href="/support" className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors">Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
