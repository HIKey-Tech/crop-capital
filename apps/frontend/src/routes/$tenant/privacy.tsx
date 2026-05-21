import { createFileRoute } from '@tanstack/react-router'

import {
  PrivacyPolicyPage,
  cropCapitalPrivacyPolicySections,
} from '@/components/legal/privacy-policy-page'
import { useTenant } from '@/contexts/tenant'

export const Route = createFileRoute('/$tenant/privacy')({
  component: PrivacyPage,
})

function PrivacyPage() {
  const { tenant: tenantParam } = Route.useParams()
  const { tenant } = useTenant()

  return (
    <PrivacyPolicyPage
      brandName={tenant.displayName}
      shortName={tenant.shortName}
      legalName={tenant.legalName || tenant.displayName}
      effectiveDate="05/20/2025"
      summary={`${tenant.displayName} uses this policy to explain how investor, tenant, operational, and platform data is collected, processed, protected, shared, and retained across regulated agricultural investment workflows.`}
      sections={cropCapitalPrivacyPolicySections}
      backLabel={`Back to ${tenant.displayName}`}
      backTo="/$tenant"
      backParams={{ tenant: tenantParam }}
      supportEmail={tenant.supportEmail || 'privacy@cropcapital.com'}
      supportPhone={tenant.supportPhone}
      address={tenant.address}
      footerLinks={[
        {
          label: 'Terms of Access',
          to: '/$tenant/terms',
          params: { tenant: tenantParam },
        },
        {
          label: 'Support',
          to: '/$tenant/support',
          params: { tenant: tenantParam },
        },
        {
          label: 'Disclosures',
          to: '/$tenant/disclosures',
          params: { tenant: tenantParam },
        },
      ]}
    />
  )
}
