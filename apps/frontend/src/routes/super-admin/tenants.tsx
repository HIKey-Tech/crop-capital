import { createFileRoute } from '@tanstack/react-router'
import { useForm } from '@mantine/form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Building2,
  DatabaseZap,
  Mail,
  MoreHorizontal,
  Pencil,
  Plus,
  Power,
  ShieldAlert,
  Trash2,
} from 'lucide-react'

import type { DeleteTenantResponse, TenantSummary } from '@/types'
import { api } from '@/lib/api-builder'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { HuePicker } from '@/components/ui/hue-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import {
  defaultTenantFeatures,
  featureLabels,
  getTenantActivationBadgeClassName,
  getTenantReadiness,
  getTenantReadinessAppearance,
  useTenants,
} from '@/lib/super-admin'

export const Route = createFileRoute('/super-admin/tenants')({
  component: TenantsPage,
})

function TenantsPage() {
  const queryClient = useQueryClient()
  const { tenantsQuery, sortedTenants } = useTenants()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingTenantId, setEditingTenantId] = useState<string | null>(null)
  const [tenantPendingDelete, setTenantPendingDelete] =
    useState<TenantSummary | null>(null)
  const [lastDeletedCleanup, setLastDeletedCleanup] = useState<
    DeleteTenantResponse['cleanup'] | null
  >(null)
  const [invitingTenant, setInvitingTenant] = useState<TenantSummary | null>(
    null,
  )
  const [inviteEmail, setInviteEmail] = useState('')

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

  const deleteTenantMutation = useMutation({
    mutationFn: api.$use.tenants.delete,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: api.tenants.list.$use() })
    },
  })

  const inviteAdminMutation = useMutation({
    mutationFn: api.$use.tenants.inviteAdmin,
    onSuccess: () => {
      setInvitingTenant(null)
      setInviteEmail('')
      toast.success('Invitation sent successfully')
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to send invitation',
      )
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
      logoUrl: '',
      faviconUrl: '',
      primaryHue: 142,
      tagline: '',
      ctaPrimaryLabel: '',
      ctaSecondaryLabel: '',
      supportEmail: '',
      supportPhone: '',
      supportWhatsapp: '',
      address: '',
      websiteUrl: '',
      termsUrl: '',
      privacyUrl: '',
      heroTitle: '',
      heroDescription: '',
      features: { ...defaultTenantFeatures },
    },
  })

  useEffect(() => {
    if (!tenantsQuery.error) return
    toast.error('Failed to load tenants')
  }, [tenantsQuery.error])

  const resetForm = () => {
    setEditingTenantId(null)
    form.reset()
  }

  const openCreateSheet = () => {
    resetForm()
    setSheetOpen(true)
  }

  const openEditSheet = (tenant: TenantSummary) => {
    form.setValues({
      name: tenant.name,
      slug: tenant.slug,
      domains: tenant.domains.join(', '),
      displayName: tenant.branding.displayName,
      shortName: tenant.branding.shortName ?? '',
      legalName: tenant.branding.legalName ?? '',
      logoUrl: tenant.branding.logoUrl ?? '',
      faviconUrl: tenant.branding.faviconUrl ?? '',
      primaryHue: tenant.branding.primaryHue ?? 142,
      tagline: tenant.branding.tagline ?? '',
      ctaPrimaryLabel: tenant.branding.ctaPrimaryLabel ?? '',
      ctaSecondaryLabel: tenant.branding.ctaSecondaryLabel ?? '',
      supportEmail: tenant.branding.supportEmail ?? '',
      supportPhone: tenant.branding.supportPhone ?? '',
      supportWhatsapp: tenant.branding.supportWhatsapp ?? '',
      address: tenant.branding.address ?? '',
      websiteUrl: tenant.branding.websiteUrl ?? '',
      termsUrl: tenant.branding.termsUrl ?? '',
      privacyUrl: tenant.branding.privacyUrl ?? '',
      heroTitle: tenant.branding.heroTitle ?? '',
      heroDescription: tenant.branding.heroDescription ?? '',
      features: { ...defaultTenantFeatures, ...tenant.features },
    })
    setEditingTenantId(tenant.id)
    setSheetOpen(true)
  }

  const closeSheet = () => {
    setSheetOpen(false)
    setTimeout(resetForm, 300)
  }

  const saveTenant = async () => {
    const values = form.values
    const editingTenant = editingTenantId
      ? sortedTenants.find((t) => t.id === editingTenantId)
      : null

    if (
      !values.name.trim() ||
      !values.slug.trim() ||
      !values.displayName.trim()
    ) {
      toast.error('Name, slug and display name are required')
      return
    }

    const payload = {
      name: values.name.trim(),
      slug: values.slug.trim().toLowerCase(),
      domains: values.domains
        .split(',')
        .map((v) => v.trim().toLowerCase())
        .filter(Boolean),
      isActive: editingTenant?.isActive ?? true,
      branding: {
        displayName: values.displayName.trim(),
        shortName: values.shortName.trim(),
        legalName: values.legalName.trim(),
        logoUrl: values.logoUrl.trim(),
        faviconUrl: values.faviconUrl.trim(),
        primaryHue: values.primaryHue,
        tagline: values.tagline.trim(),
        ctaPrimaryLabel: values.ctaPrimaryLabel.trim(),
        ctaSecondaryLabel: values.ctaSecondaryLabel.trim(),
        supportEmail: values.supportEmail.trim(),
        supportPhone: values.supportPhone.trim(),
        supportWhatsapp: values.supportWhatsapp.trim(),
        address: values.address.trim(),
        websiteUrl: values.websiteUrl.trim(),
        termsUrl: values.termsUrl.trim(),
        privacyUrl: values.privacyUrl.trim(),
        heroTitle: values.heroTitle.trim(),
        heroDescription: values.heroDescription.trim(),
      },
      features: values.features,
    }

    try {
      editingTenantId
        ? await updateTenantMutation.mutateAsync({
            id: editingTenantId,
            data: payload,
          })
        : await createTenantMutation.mutateAsync(payload)

      closeSheet()
      toast.success(
        editingTenantId
          ? 'Tenant updated successfully'
          : 'Tenant created successfully',
      )
    } catch (error) {
      console.error(error)
      toast.error(
        editingTenantId ? 'Failed to update tenant' : 'Failed to create tenant',
      )
    }
  }

  const toggleActive = async (tenant: TenantSummary) => {
    try {
      const response = await updateTenantMutation.mutateAsync({
        id: tenant.id,
        data: { isActive: !tenant.isActive },
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

  const confirmDeleteTenant = async () => {
    if (!tenantPendingDelete) return

    try {
      const response = await deleteTenantMutation.mutateAsync(
        tenantPendingDelete.id,
      )
      setLastDeletedCleanup(response.cleanup)
      setTenantPendingDelete(null)
      resetForm()
      toast.success(
        `Deleted ${tenantPendingDelete.name} and removed ${response.cleanup.usersDeleted} tenant users, ${response.cleanup.farmsDeleted} farms, and ${response.cleanup.investmentsDeleted} investments`,
      )
    } catch (error) {
      console.error(error)
      toast.error('Failed to delete tenant')
    }
  }

  const isSaving =
    createTenantMutation.isPending || updateTenantMutation.isPending

  const sendInvite = async () => {
    if (!invitingTenant || !inviteEmail.trim()) return
    await inviteAdminMutation.mutateAsync({
      id: invitingTenant.id,
      email: inviteEmail.trim(),
    })
  }

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Tenants
          </h1>
          <p className="text-sm text-muted-foreground">
            Create, configure, and manage tenant workspaces, branding, and
            feature toggles.
          </p>
        </div>
        <Button onClick={openCreateSheet}>
          <Plus className="h-4 w-4" />
          New Tenant
        </Button>
      </div>

      {lastDeletedCleanup && (
        <div className="rounded-2xl border border-emerald-200/80 bg-linear-to-br from-emerald-50/95 to-sky-50/90 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-800">
                <DatabaseZap className="h-3.5 w-3.5" />
                Cleanup Complete
              </div>
              <p className="text-sm font-medium text-foreground">
                {lastDeletedCleanup.tenantSlug} removed successfully
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLastDeletedCleanup(null)}
            >
              Dismiss
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-emerald-200 bg-background/90 px-2.5 py-1 text-emerald-900">
              {lastDeletedCleanup.usersDeleted} users
            </span>
            <span className="rounded-full border border-emerald-200 bg-background/90 px-2.5 py-1 text-emerald-900">
              {lastDeletedCleanup.farmsDeleted} farms
            </span>
            <span className="rounded-full border border-emerald-200 bg-background/90 px-2.5 py-1 text-emerald-900">
              {lastDeletedCleanup.investmentsDeleted} investments
            </span>
            <span className="rounded-full border border-emerald-200 bg-background/90 px-2.5 py-1 text-emerald-900">
              {lastDeletedCleanup.kycDocumentsDeleted} KYC docs
            </span>
            <span className="rounded-full border border-emerald-200 bg-background/90 px-2.5 py-1 text-emerald-900">
              {lastDeletedCleanup.activitiesDeleted} activities
            </span>
            <span className="rounded-full border border-emerald-200 bg-background/90 px-2.5 py-1 text-emerald-900">
              {lastDeletedCleanup.farmImagesDeleted} farm images
            </span>
            <span className="rounded-full border border-emerald-200 bg-background/90 px-2.5 py-1 text-emerald-900">
              {lastDeletedCleanup.kycImagesDeleted} KYC images
            </span>
            {(lastDeletedCleanup.farmImagesFailed > 0 ||
              lastDeletedCleanup.kycImagesFailed > 0) && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-200 px-2.5 py-1 text-amber-900">
                <ShieldAlert className="h-3 w-3" />
                {lastDeletedCleanup.farmImagesFailed +
                  lastDeletedCleanup.kycImagesFailed}{' '}
                asset failures
              </span>
            )}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card shadow-sm">
        {tenantsQuery.isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Loading tenants...
          </div>
        ) : sortedTenants.length === 0 ? (
          <div className="p-8 text-center">
            <Building2 className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              No tenants yet. Create your first tenant to get started.
            </p>
            <Button className="mt-4" onClick={openCreateSheet}>
              <Plus className="h-4 w-4" />
              New Tenant
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Tenant
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Slug
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Readiness
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Features
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedTenants.map((tenant) => {
                  const readiness = getTenantReadiness(tenant)
                  const readinessAppearance = getTenantReadinessAppearance(
                    readiness.status,
                  )
                  const features = {
                    ...defaultTenantFeatures,
                    ...tenant.features,
                  }
                  const enabledCount =
                    Object.values(features).filter(Boolean).length
                  const totalCount = featureLabels.length

                  return (
                    <tr
                      key={tenant.id}
                      className="border-b border-border last:border-0 transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">
                          {tenant.name}
                        </div>
                        {tenant.domains.length > 0 && (
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {tenant.domains[0]}
                            {tenant.domains.length > 1 &&
                              ` +${tenant.domains.length - 1}`}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                        {tenant.slug}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={tenant.isActive ? 'default' : 'secondary'}
                          className={getTenantActivationBadgeClassName(
                            tenant.isActive,
                          )}
                        >
                          {tenant.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={readinessAppearance.badgeClassName}
                        >
                          {readinessAppearance.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">
                          {enabledCount}/{totalCount}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openEditSheet(tenant)}
                            >
                              <Pencil className="h-4 w-4" />
                              Edit Tenant
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleActive(tenant)}
                            >
                              <Power className="h-4 w-4" />
                              {tenant.isActive ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setInvitingTenant(tenant)
                                setInviteEmail('')
                              }}
                            >
                              <Mail className="h-4 w-4" />
                              Invite Admin
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setTenantPendingDelete(tenant)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete Tenant
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={(open) => !open && closeSheet()}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingTenantId ? 'Edit Tenant' : 'New Tenant'}
            </SheetTitle>
            <SheetDescription>
              {editingTenantId
                ? 'Update tenant configuration, branding, and features.'
                : 'Set up a new tenant workspace with branding and features.'}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-6 px-6 pb-2">
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-foreground">
                Identity
              </legend>
              <div className="grid gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Tenant Name *</Label>
                  <Input {...form.getInputProps('name')} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Slug *</Label>
                    <Input {...form.getInputProps('slug')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Legal Name</Label>
                    <Input {...form.getInputProps('legalName')} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Domains (comma-separated)</Label>
                  <Input
                    {...form.getInputProps('domains')}
                    placeholder="tenant.yourplatform.com, clientdomain.com"
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-foreground">
                Branding
              </legend>
              <div className="grid gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Display Name *</Label>
                    <Input {...form.getInputProps('displayName')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Short Name</Label>
                    <Input {...form.getInputProps('shortName')} />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Logo URL</Label>
                    <Input {...form.getInputProps('logoUrl')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Favicon URL</Label>
                    <Input {...form.getInputProps('faviconUrl')} />
                  </div>
                </div>
                <HuePicker
                  label="Brand Color"
                  value={form.values.primaryHue}
                  onChange={(hue) => form.setFieldValue('primaryHue', hue)}
                />
                <div className="space-y-1.5">
                  <Label className="text-xs">Tagline</Label>
                  <Textarea {...form.getInputProps('tagline')} rows={2} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Hero Title</Label>
                  <Input {...form.getInputProps('heroTitle')} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Hero Description</Label>
                  <Textarea
                    {...form.getInputProps('heroDescription')}
                    rows={2}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Primary CTA Label</Label>
                    <Input {...form.getInputProps('ctaPrimaryLabel')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Secondary CTA Label</Label>
                    <Input {...form.getInputProps('ctaSecondaryLabel')} />
                  </div>
                </div>
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-foreground">
                Contact
              </legend>
              <div className="grid gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Support Email</Label>
                    <Input {...form.getInputProps('supportEmail')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Support Phone</Label>
                    <Input {...form.getInputProps('supportPhone')} />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Support WhatsApp</Label>
                    <Input {...form.getInputProps('supportWhatsapp')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Website URL</Label>
                    <Input {...form.getInputProps('websiteUrl')} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Address</Label>
                  <Textarea {...form.getInputProps('address')} rows={2} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Terms URL</Label>
                    <Input {...form.getInputProps('termsUrl')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Privacy URL</Label>
                    <Input {...form.getInputProps('privacyUrl')} />
                  </div>
                </div>
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-foreground">
                Features
              </legend>
              <div className="grid gap-2.5 sm:grid-cols-2">
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
            </fieldset>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={closeSheet} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={saveTenant} disabled={isSaving}>
              {isSaving
                ? editingTenantId
                  ? 'Saving...'
                  : 'Creating...'
                : editingTenantId
                  ? 'Save Changes'
                  : 'Create Tenant'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={tenantPendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setTenantPendingDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tenant Permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              {tenantPendingDelete
                ? `Deleting ${tenantPendingDelete.name} will permanently remove every tenant-bound admin, investor membership, farm, investment, KYC record, activity, and webhook event under this tenancy.`
                : 'Deleting a tenant removes all tenant-bound data.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteTenantMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDeleteTenant}
              disabled={deleteTenantMutation.isPending}
            >
              {deleteTenantMutation.isPending ? 'Deleting...' : 'Delete Tenant'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={invitingTenant !== null}
        onOpenChange={(open) => {
          if (!open) setInvitingTenant(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Invite Admin to {invitingTenant?.name}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Enter the email address of the person to invite as a tenant
              administrator. They'll receive an activation link by email.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label htmlFor="invite-email" className="text-sm">
              Email Address
            </Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="admin@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="mt-1.5"
              onKeyDown={(e) => {
                if (e.key === 'Enter') void sendInvite()
              }}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={inviteAdminMutation.isPending}
              onClick={() => setInvitingTenant(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void sendInvite()}
              disabled={inviteAdminMutation.isPending || !inviteEmail.trim()}
            >
              {inviteAdminMutation.isPending ? 'Sending...' : 'Send Invite'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
