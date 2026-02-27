import { createFileRoute, redirect } from '@tanstack/react-router'
import { useForm } from '@mantine/form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Building2, RefreshCcw, UserPlus } from 'lucide-react'

import type { TenantFeatures, TenantSummary } from '@/types'
import { api } from '@/lib/api-builder'
import { clearAuthToken, getAuthToken } from '@/lib/api-client'
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

export const Route = createFileRoute('/super-admin/')({
  beforeLoad: async ({ context }) => {
    const token = getAuthToken()

    if (!token) {
      throw redirect({ to: '/auth' })
    }

    try {
      const response = await context.queryClient.ensureQueryData({
        queryKey: api.auth.me.$use(),
        queryFn: () => api.$use.auth.me(),
        staleTime: 1000 * 60 * 5,
      })

      if (response.user.role !== 'super_admin') {
        throw redirect({ to: '/auth' })
      }
    } catch {
      clearAuthToken()
      throw redirect({
        to: '/auth',
      })
    }
  },
  component: SuperAdminTenantPage,
})

function SuperAdminTenantPage() {
  const queryClient = useQueryClient()
  const [assigningTenantId, setAssigningTenantId] = useState<string | null>(
    null,
  )
  const [savingFeaturesTenantId, setSavingFeaturesTenantId] = useState<
    string | null
  >(null)
  const [featureDrafts, setFeatureDrafts] = useState<
    Partial<Record<string, TenantFeatures>>
  >({})

  const tenantsQuery = useQuery({
    queryKey: api.tenants.list.$use(),
    queryFn: () => api.$use.tenants.list(),
  })

  const createTenantMutation = useMutation({
    mutationFn: api.$use.tenants.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: api.tenants.list.$use() })
    },
  })

  const updateTenantMutation = useMutation({
    mutationFn: api.$use.tenants.update,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: api.tenants.list.$use() })
    },
  })

  const assignUnassignedUsersMutation = useMutation({
    mutationFn: api.$use.tenants.assignUnassignedUsers,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: api.tenants.list.$use() })
    },
  })

  const form = useForm({
    initialValues: {
      name: '',
      slug: '',
      domains: '',
      displayName: '',
      shortName: '',
      legalName: '',
      primaryColor: '142 64% 32%',
      tagline: '',
      supportEmail: '',
      supportPhone: '',
      heroTitle: '',
      heroDescription: '',
      features: { ...defaultTenantFeatures },
    },
  })

  const sortedTenants = useMemo(
    () =>
      [...(tenantsQuery.data?.tenants || [])].sort((first, second) =>
        first.slug.localeCompare(second.slug),
      ),
    [tenantsQuery.data?.tenants],
  )

  useEffect(() => {
    if (!tenantsQuery.data?.tenants) return

    setFeatureDrafts((current) => {
      const next = { ...current }

      for (const tenant of tenantsQuery.data.tenants) {
        next[tenant.id] = {
          ...defaultTenantFeatures,
          ...tenant.features,
        }
      }

      return next
    })
  }, [tenantsQuery.data?.tenants])

  useEffect(() => {
    if (!tenantsQuery.error) return
    toast.error('Failed to load tenants')
  }, [tenantsQuery.error])

  const resetForm = () => {
    form.reset()
  }

  const createTenant = async () => {
    const values = form.values

    if (
      !values.name.trim() ||
      !values.slug.trim() ||
      !values.displayName.trim()
    ) {
      toast.error('Name, slug and display name are required')
      return
    }

    try {
      const response = await createTenantMutation.mutateAsync({
        name: values.name.trim(),
        slug: values.slug.trim().toLowerCase(),
        domains: values.domains
          .split(',')
          .map((value) => value.trim().toLowerCase())
          .filter(Boolean),
        isActive: true,
        branding: {
          displayName: values.displayName.trim(),
          shortName: values.shortName.trim(),
          legalName: values.legalName.trim(),
          primaryColor: values.primaryColor.trim(),
          tagline: values.tagline.trim(),
          supportEmail: values.supportEmail.trim(),
          supportPhone: values.supportPhone.trim(),
          heroTitle: values.heroTitle.trim(),
          heroDescription: values.heroDescription.trim(),
        },
        features: values.features,
      })

      setFeatureDrafts((current) => ({
        ...current,
        [response.tenant.id]: {
          ...defaultTenantFeatures,
          ...response.tenant.features,
        },
      }))
      resetForm()
      toast.success('Tenant created successfully')
    } catch (error) {
      console.error(error)
      toast.error('Failed to create tenant')
    }
  }

  const toggleActive = async (tenant: TenantSummary) => {
    try {
      const response = await updateTenantMutation.mutateAsync({
        id: tenant.id,
        data: {
          isActive: !tenant.isActive,
        },
      })

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
      const response = await assignUnassignedUsersMutation.mutateAsync(tenantId)
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
        ...(current[tenantId] ?? {}),
        [key]: value,
      },
    }))
  }

  const saveTenantFeatures = async (tenant: TenantSummary) => {
    const nextFeatures = featureDrafts[tenant.id] || {
      ...defaultTenantFeatures,
    }

    try {
      setSavingFeaturesTenantId(tenant.id)
      const response = await updateTenantMutation.mutateAsync({
        id: tenant.id,
        data: {
          features: nextFeatures,
        },
      })

      setFeatureDrafts((current) => ({
        ...current,
        [tenant.id]: {
          ...defaultTenantFeatures,
          ...response.tenant.features,
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
            <Input {...form.getInputProps('name')} />
          </div>
          <div className="space-y-2">
            <Label>Slug *</Label>
            <Input {...form.getInputProps('slug')} />
          </div>
          <div className="space-y-2">
            <Label>Display Name *</Label>
            <Input {...form.getInputProps('displayName')} />
          </div>
          <div className="space-y-2">
            <Label>Short Name</Label>
            <Input {...form.getInputProps('shortName')} />
          </div>
          <div className="space-y-2">
            <Label>Legal Name</Label>
            <Input {...form.getInputProps('legalName')} />
          </div>
          <div className="space-y-2">
            <Label>Primary Color (HSL triplet)</Label>
            <Input {...form.getInputProps('primaryColor')} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Domains (comma-separated)</Label>
            <Input
              {...form.getInputProps('domains')}
              placeholder="tenant.yourplatform.com, clientdomain.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Support Email</Label>
            <Input {...form.getInputProps('supportEmail')} />
          </div>
          <div className="space-y-2">
            <Label>Support Phone</Label>
            <Input {...form.getInputProps('supportPhone')} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Tagline</Label>
            <Textarea {...form.getInputProps('tagline')} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Hero Title</Label>
            <Input {...form.getInputProps('heroTitle')} />
          </div>
          <div className="space-y-2">
            <Label>Hero Description</Label>
            <Textarea {...form.getInputProps('heroDescription')} rows={2} />
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
                    checked={form.values.features[feature.key]}
                    onCheckedChange={(checked) =>
                      form.setFieldValue('features', {
                        ...form.values.features,
                        [feature.key]: checked === true,
                      })
                    }
                  />
                  <span>{feature.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={createTenant}
            disabled={createTenantMutation.isPending}
          >
            {createTenantMutation.isPending ? 'Creating...' : 'Create Tenant'}
          </Button>
          <Button
            variant="outline"
            onClick={resetForm}
            disabled={createTenantMutation.isPending}
          >
            Reset
          </Button>
        </div>
      </section>

      <section className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Existing Tenants</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => tenantsQuery.refetch()}
            disabled={tenantsQuery.isFetching}
          >
            <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>

        {tenantsQuery.isLoading ? (
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
                      {tenant.domains.length ? tenant.domains.join(', ') : '-'}
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
                    <td className="p-3 min-w-85">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {featureLabels.map((feature) => (
                          <label
                            key={`${tenant.id}-${feature.key}`}
                            className="flex items-center gap-2 text-xs text-foreground"
                          >
                            <Checkbox
                              checked={
                                (featureDrafts[tenant.id] ??
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
