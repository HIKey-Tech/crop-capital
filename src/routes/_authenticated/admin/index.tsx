import { createFileRoute, redirect } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Building2, RefreshCcw, UserPlus } from 'lucide-react'

import { tenantApi } from '@/lib/api-client'
import type { TenantFeatures, TenantSummary } from '@/types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const defaultTenantFeatures: TenantFeatures = {
  investments: true,
  wallet: true,
  transactions: true,
  farms: true,
  news: true,
  notifications: true,
  adminPortal: true,
  adminFarms: true,
  adminInvestors: true,
  adminTransactions: true,
  adminPayouts: true,
  adminKyc: true,
  adminReports: true,
}

const featureLabels: Array<{ key: keyof TenantFeatures; label: string }> = [
  { key: 'investments', label: 'Investments' },
  { key: 'wallet', label: 'Wallet' },
  { key: 'transactions', label: 'Transactions' },
  { key: 'farms', label: 'Farms' },
  { key: 'news', label: 'News' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'adminPortal', label: 'Admin Portal' },
  { key: 'adminFarms', label: 'Admin Farms' },
  { key: 'adminInvestors', label: 'Admin Investors' },
  { key: 'adminTransactions', label: 'Admin Transactions' },
  { key: 'adminPayouts', label: 'Admin Payouts' },
  { key: 'adminKyc', label: 'Admin KYC' },
  { key: 'adminReports', label: 'Admin Reports' },
]

export const Route = createFileRoute('/_authenticated/admin/')({
  beforeLoad: ({ context }) => {
    if (context.user.role !== 'super_admin') {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: SuperAdminTenantPage,
})

function SuperAdminTenantPage() {
  const [tenants, setTenants] = useState<TenantSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [assigningTenantId, setAssigningTenantId] = useState<string | null>(
    null,
  )
  const [savingFeaturesTenantId, setSavingFeaturesTenantId] = useState<
    string | null
  >(null)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [domains, setDomains] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [shortName, setShortName] = useState('')
  const [legalName, setLegalName] = useState('')
  const [primaryColor, setPrimaryColor] = useState('142 64% 32%')
  const [tagline, setTagline] = useState('')
  const [supportEmail, setSupportEmail] = useState('')
  const [supportPhone, setSupportPhone] = useState('')
  const [heroTitle, setHeroTitle] = useState('')
  const [heroDescription, setHeroDescription] = useState('')
  const [features, setFeatures] = useState<TenantFeatures>(
    defaultTenantFeatures,
  )
  const [featureDrafts, setFeatureDrafts] = useState<
    Record<string, TenantFeatures>
  >({})

  const sortedTenants = useMemo(
    () =>
      [...tenants].sort((first, second) =>
        first.slug.localeCompare(second.slug),
      ),
    [tenants],
  )

  const loadTenants = async () => {
    try {
      setLoading(true)
      const response = await tenantApi.list()
      setTenants(response.tenants)
      setFeatureDrafts(
        response.tenants.reduce<Record<string, TenantFeatures>>(
          (accumulator, tenant) => {
            accumulator[tenant.id] = {
              ...defaultTenantFeatures,
              ...(tenant.features || {}),
            }
            return accumulator
          },
          {},
        ),
      )
    } catch (error) {
      console.error(error)
      toast.error('Failed to load tenants')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTenants()
  }, [])

  const resetForm = () => {
    setName('')
    setSlug('')
    setDomains('')
    setDisplayName('')
    setShortName('')
    setLegalName('')
    setPrimaryColor('142 64% 32%')
    setTagline('')
    setSupportEmail('')
    setSupportPhone('')
    setHeroTitle('')
    setHeroDescription('')
    setFeatures(defaultTenantFeatures)
  }

  const createTenant = async () => {
    if (!name.trim() || !slug.trim() || !displayName.trim()) {
      toast.error('Name, slug and display name are required')
      return
    }

    try {
      setSubmitting(true)
      const response = await tenantApi.create({
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        domains: domains
          .split(',')
          .map((value) => value.trim().toLowerCase())
          .filter(Boolean),
        isActive: true,
        branding: {
          displayName: displayName.trim(),
          shortName: shortName.trim() || undefined,
          legalName: legalName.trim() || undefined,
          primaryColor: primaryColor.trim() || undefined,
          tagline: tagline.trim() || undefined,
          supportEmail: supportEmail.trim() || undefined,
          supportPhone: supportPhone.trim() || undefined,
          heroTitle: heroTitle.trim() || undefined,
          heroDescription: heroDescription.trim() || undefined,
        },
        features,
      })

      setTenants((current) => [response.tenant, ...current])
      setFeatureDrafts((current) => ({
        ...current,
        [response.tenant.id]: {
          ...defaultTenantFeatures,
          ...(response.tenant.features || {}),
        },
      }))
      resetForm()
      toast.success('Tenant created successfully')
    } catch (error) {
      console.error(error)
      toast.error('Failed to create tenant')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleActive = async (tenant: TenantSummary) => {
    try {
      const response = await tenantApi.update(tenant.id, {
        isActive: !tenant.isActive,
      })

      setTenants((current) =>
        current.map((item) => (item.id === tenant.id ? response.tenant : item)),
      )

      toast.success(
        response.tenant.isActive
          ? 'Tenant activated successfully'
          : 'Tenant deactivated successfully',
      )
    } catch (error) {
      console.error(error)
      toast.error('Failed to update tenant status')
    }
  }

  const assignUnassignedUsers = async (tenantId: string) => {
    try {
      setAssigningTenantId(tenantId)
      const response = await tenantApi.assignUnassignedUsers(tenantId)
      toast.success(`Assigned ${response.updatedCount} users`)
    } catch (error) {
      console.error(error)
      toast.error('Failed to assign users')
    } finally {
      setAssigningTenantId(null)
    }
  }

  const updateFeatureDraft = (
    tenantId: string,
    key: keyof TenantFeatures,
    value: boolean,
  ) => {
    setFeatureDrafts((current) => ({
      ...current,
      [tenantId]: {
        ...defaultTenantFeatures,
        ...(current[tenantId] || {}),
        [key]: value,
      },
    }))
  }

  const saveTenantFeatures = async (tenant: TenantSummary) => {
    const nextFeatures = featureDrafts[tenant.id] || defaultTenantFeatures

    try {
      setSavingFeaturesTenantId(tenant.id)
      const response = await tenantApi.update(tenant.id, {
        features: nextFeatures,
      })

      setTenants((current) =>
        current.map((item) => (item.id === tenant.id ? response.tenant : item)),
      )

      setFeatureDrafts((current) => ({
        ...current,
        [tenant.id]: {
          ...defaultTenantFeatures,
          ...(response.tenant.features || {}),
        },
      }))

      toast.success('Feature toggles updated')
    } catch (error) {
      console.error(error)
      toast.error('Failed to update feature toggles')
    } finally {
      setSavingFeaturesTenantId(null)
    }
  }

  return (
    <div className="space-y-8 max-w-screen-2xl mx-auto px-4 mb-10">
      <header className="pt-3 mb-2 flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Super Admin · Tenant Onboarding
        </h1>
        <p className="text-base text-muted-foreground">
          Create and manage tenants without code changes.
        </p>
      </header>

      <section className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" /> Create Tenant
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tenant Name *</Label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Slug *</Label>
            <Input
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Display Name *</Label>
            <Input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Short Name</Label>
            <Input
              value={shortName}
              onChange={(event) => setShortName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Legal Name</Label>
            <Input
              value={legalName}
              onChange={(event) => setLegalName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Primary Color (HSL triplet)</Label>
            <Input
              value={primaryColor}
              onChange={(event) => setPrimaryColor(event.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Domains (comma-separated)</Label>
            <Input
              value={domains}
              onChange={(event) => setDomains(event.target.value)}
              placeholder="tenant.yourplatform.com, clientdomain.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Support Email</Label>
            <Input
              value={supportEmail}
              onChange={(event) => setSupportEmail(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Support Phone</Label>
            <Input
              value={supportPhone}
              onChange={(event) => setSupportPhone(event.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Tagline</Label>
            <Textarea
              value={tagline}
              onChange={(event) => setTagline(event.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Hero Title</Label>
            <Input
              value={heroTitle}
              onChange={(event) => setHeroTitle(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Hero Description</Label>
            <Textarea
              value={heroDescription}
              onChange={(event) => setHeroDescription(event.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Feature Toggles</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 rounded-md border border-border p-3">
              {featureLabels.map((feature) => (
                <label
                  key={feature.key}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <Checkbox
                    checked={features[feature.key]}
                    onCheckedChange={(checked) =>
                      setFeatures((current) => ({
                        ...current,
                        [feature.key]: checked === true,
                      }))
                    }
                  />
                  <span>{feature.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={createTenant} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Tenant'}
          </Button>
          <Button variant="outline" onClick={resetForm} disabled={submitting}>
            Reset
          </Button>
        </div>
      </section>

      <section className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Existing Tenants</h2>
          <Button variant="outline" size="sm" onClick={loadTenants}>
            <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading tenants...</p>
        ) : (
          <div className="overflow-x-auto border border-border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3">Tenant</th>
                  <th className="text-left p-3">Slug</th>
                  <th className="text-left p-3">Domains</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Features</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedTenants.map((tenant) => (
                  <tr key={tenant.id} className="border-t border-border">
                    <td className="p-3 font-medium">{tenant.name}</td>
                    <td className="p-3 text-muted-foreground">{tenant.slug}</td>
                    <td className="p-3 text-muted-foreground">
                      {tenant.domains?.length ? tenant.domains.join(', ') : '-'}
                    </td>
                    <td className="p-3">
                      <span
                        className={
                          tenant.isActive
                            ? 'text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs'
                            : 'text-zinc-700 bg-zinc-100 px-2 py-1 rounded-full text-xs'
                        }
                      >
                        {tenant.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3 min-w-[340px]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {featureLabels.map((feature) => (
                          <label
                            key={`${tenant.id}-${feature.key}`}
                            className="flex items-center gap-2 text-xs text-foreground"
                          >
                            <Checkbox
                              checked={
                                (featureDrafts[tenant.id] ||
                                  defaultTenantFeatures)[feature.key]
                              }
                              onCheckedChange={(checked) =>
                                updateFeatureDraft(
                                  tenant.id,
                                  feature.key,
                                  checked === true,
                                )
                              }
                            />
                            <span>{feature.label}</span>
                          </label>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleActive(tenant)}
                        >
                          {tenant.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => assignUnassignedUsers(tenant.id)}
                          disabled={assigningTenantId === tenant.id}
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          {assigningTenantId === tenant.id
                            ? 'Assigning...'
                            : 'Assign Unassigned Users'}
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => saveTenantFeatures(tenant)}
                          disabled={savingFeaturesTenantId === tenant.id}
                        >
                          {savingFeaturesTenantId === tenant.id
                            ? 'Saving...'
                            : 'Save Features'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sortedTenants.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-4 text-center text-muted-foreground"
                    >
                      No tenants found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
