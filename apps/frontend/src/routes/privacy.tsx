import { createFileRoute } from '@tanstack/react-router'

import {
  PrivacyPolicyPage,
  cropCapitalPrivacyPolicySections,
} from '@/components/legal/privacy-policy-page'

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
})

function PrivacyPage() {
  return (
    <PrivacyPolicyPage
      brandName="CropCapital"
      shortName="CC"
      legalName="CropCapital"
      effectiveDate="05/20/2025"
      summary="This policy covers how CropCapital collects, uses, shares, protects, and retains personal information across platform accounts, investment workflows, farm operations, communications, and partner integrations."
      sections={cropCapitalPrivacyPolicySections}
      backLabel="Back to Platform"
      backTo="/"
      supportEmail="privacy@cropcapital.com"
      supportPhone="+23409132508804"
      address="CropCapital Headquarter, TheCans Park, IBB Boulevard, Maitama, Abuja."
      footerLinks={[
        { label: 'Terms of Service', to: '/terms' },
        { label: 'Privacy Policy', to: '/privacy' },
        { label: 'Support', to: '/support' },
      ]}
    />
  )
}
