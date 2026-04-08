import { useEffect, useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  Building2,
  Camera,
  Landmark,
  Mail,
  MapPin,
  Save,
  Trash2,
  User,
} from 'lucide-react'

import { useForm } from '@mantine/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTenant } from '@/contexts/tenant'
import {
  usePaystackAccountResolution,
  usePaystackBanks,
  useUpdateProfile,
} from '@/hooks/use-auth'

export const Route = createFileRoute('/$tenant/_authenticated/settings/')({
  component: ProfileSettingsPage,
})

function ProfileSettingsPage() {
  const { user } = Route.useRouteContext()
  const { tenant } = useTenant()
  const { mutate: updateProfile, isPending } = useUpdateProfile()
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const photoInputRef = useRef<HTMLInputElement | null>(null)

  const form = useForm({
    initialValues: {
      name: user.name,
      country: user.country || '',
      accountName: user.bankAccount?.accountName || user.name,
      bankName: user.bankAccount?.bankName || '',
      bankCode: user.bankAccount?.bankCode || '',
      accountNumber: user.bankAccount?.accountNumber || '',
    },
  })

  useEffect(() => {
    setSelectedPhoto(null)
    setPreviewPhotoUrl(null)
    setRemovePhoto(false)
  }, [user.photo])

  const { data: bankDirectory, isLoading: isBanksLoading } = usePaystackBanks(
    form.values.country,
  )
  const bankOptions = bankDirectory?.banks ?? []
  const normalizedAccountNumber = form.values.accountNumber.replace(/\s+/g, '')
  const requiresResolvedAccount = Boolean(form.values.bankCode.trim())
  const { data: resolvedAccount, isFetching: isResolvingAccount } =
    usePaystackAccountResolution(
      form.values.bankCode,
      normalizedAccountNumber,
      requiresResolvedAccount,
    )

  useEffect(() => {
    if (
      form.values.bankCode ||
      !form.values.bankName ||
      bankOptions.length === 0
    ) {
      return
    }

    const matchingBank = bankOptions.find(
      (bank) =>
        bank.name.toLowerCase() === form.values.bankName.trim().toLowerCase(),
    )

    if (matchingBank) {
      form.setFieldValue('bankCode', matchingBank.code)
    }
  }, [bankOptions, form, form.values.bankCode, form.values.bankName])

  useEffect(() => {
    if (isBanksLoading || !form.values.bankCode) {
      return
    }

    const matchingBank = bankOptions.find(
      (bank) => bank.code === form.values.bankCode,
    )

    if (!matchingBank) {
      form.setFieldValue('bankCode', '')
    }
  }, [bankOptions, form, form.values.bankCode, isBanksLoading])

  useEffect(() => {
    if (!requiresResolvedAccount) {
      return
    }

    if (normalizedAccountNumber.length < 6) {
      form.setFieldValue('accountName', '')
      return
    }

    if (resolvedAccount?.resolved && resolvedAccount.accountName) {
      if (form.values.accountName !== resolvedAccount.accountName) {
        form.setFieldValue('accountName', resolvedAccount.accountName)
      }
      return
    }

    if (
      resolvedAccount &&
      !resolvedAccount.resolved &&
      form.values.accountName
    ) {
      form.setFieldValue('accountName', '')
    }
  }, [
    form,
    form.values.accountName,
    normalizedAccountNumber,
    requiresResolvedAccount,
    resolvedAccount,
  ])

  const handleBankNameChange = (value: string) => {
    form.setFieldValue('bankName', value)

    const matchingBank = bankOptions.find(
      (bank) => bank.name.toLowerCase() === value.trim().toLowerCase(),
    )

    form.setFieldValue('bankCode', matchingBank?.code ?? '')

    if (matchingBank) {
      form.setFieldValue('accountName', '')
    }
  }

  const handleAccountNumberChange = (value: string) => {
    const sanitizedValue = value.replace(/[^\d\s]/g, '')

    form.setFieldValue('accountNumber', sanitizedValue)

    if (requiresResolvedAccount) {
      form.setFieldValue('accountName', '')
    }
  }

  const handleSubmit = (values: typeof form.values) => {
    const normalizedBankAccount = {
      accountName:
        values.bankCode.trim() &&
        resolvedAccount?.resolved &&
        resolvedAccount.accountName
          ? resolvedAccount.accountName.trim()
          : values.accountName.trim(),
      bankName: values.bankName.trim(),
      bankCode: values.bankCode.trim() || undefined,
      accountNumber: values.accountNumber.replace(/\s+/g, ''),
    }

    const populatedBankFieldCount = Object.values(normalizedBankAccount).filter(
      Boolean,
    ).length

    if (populatedBankFieldCount > 0 && populatedBankFieldCount < 3) {
      toast.error('Complete all bank payout fields before saving')
      return
    }

    if (
      bankOptions.length > 0 &&
      values.bankName.trim() &&
      !values.bankCode.trim()
    ) {
      toast.error('Choose a bank from the Paystack suggestions before saving')
      return
    }

    if (values.bankCode.trim() && !resolvedAccount?.resolved) {
      toast.error(
        'Enter a valid account number so Paystack can verify the payout account',
      )
      return
    }

    updateProfile(
      {
        name: values.name,
        country: values.country,
        photo: selectedPhoto,
        removePhoto,
        bankAccount: normalizedBankAccount,
      },
      {
        onSuccess: () => {
          setSelectedPhoto(null)
          setPreviewPhotoUrl(null)
          setRemovePhoto(false)
          toast.success('Profile updated successfully')
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Failed to update profile')
        },
      },
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const displayedPhotoUrl = removePhoto
    ? undefined
    : previewPhotoUrl || user.photo

  const handlePhotoSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedPhoto(file)
    setPreviewPhotoUrl(URL.createObjectURL(file))
    setRemovePhoto(false)
    event.target.value = ''
  }

  const handlePhotoRemoved = () => {
    setSelectedPhoto(null)
    setPreviewPhotoUrl(null)
    setRemovePhoto(Boolean(user.photo))
  }

  const openPhotoPicker = () => {
    photoInputRef.current?.click()
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-6 pb-6 border-b border-border">
        <div className="relative group">
          <Avatar className="h-24 w-24 border-4 border-white shadow-sm">
            <AvatarImage src={displayedPhotoUrl} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoSelected}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background shadow-sm transition hover:bg-accent"
                aria-label={
                  displayedPhotoUrl
                    ? 'Change profile photo'
                    : 'Upload profile photo'
                }
              >
                <Camera className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onSelect={openPhotoPicker}>
                <Camera className="mr-2 h-4 w-4" />
                {displayedPhotoUrl ? 'Replace photo' : 'Upload photo'}
              </DropdownMenuItem>
              {displayedPhotoUrl ? (
                <DropdownMenuItem
                  onSelect={handlePhotoRemoved}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove photo
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-muted-foreground capitalize">
            {user.role} Account
          </p>
          {user.isVerified ? (
            <Badge
              variant="outline"
              className="mt-2 border-primary/20 bg-primary/10 text-primary"
            >
              Verified
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="mt-2 border-accent/25 bg-accent/15 text-foreground"
            >
              Unverified
            </Badge>
          )}
        </div>
      </div>

      <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              {...form.getInputProps('name')}
              className="pl-9"
              placeholder="Enter your full name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={user.email}
              className="pl-9"
              disabled
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Contact {tenant.displayName} support to change your email address.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="country"
              {...form.getInputProps('country')}
              className="pl-9"
              placeholder="Enter your country"
            />
          </div>
        </div>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Bank Payout Details
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Returns from completed investments will be sent to this account.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountName">Account Name</Label>
            <div className="relative">
              <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="accountName"
                {...form.getInputProps('accountName')}
                className="pl-9"
                placeholder="Name on your bank account"
                readOnly={requiresResolvedAccount}
              />
            </div>
            {requiresResolvedAccount ? (
              <p className="text-xs text-muted-foreground">
                {isResolvingAccount
                  ? 'Verifying account name with Paystack...'
                  : resolvedAccount?.resolved && resolvedAccount.accountName
                    ? `Verified by Paystack as ${resolvedAccount.accountName}.`
                    : normalizedAccountNumber.length >= 6
                      ? 'We could not verify this account number yet.'
                      : 'Enter the account number to verify the payout account automatically.'}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="bankName"
                  value={form.values.bankName}
                  onChange={(event) => handleBankNameChange(event.target.value)}
                  className="pl-9"
                  placeholder={
                    bankOptions.length > 0
                      ? 'Type or choose a bank'
                      : 'e.g. Access Bank'
                  }
                  list={
                    bankOptions.length > 0 ? 'settings-bank-options' : undefined
                  }
                />
              </div>
              {bankOptions.length > 0 ? (
                <>
                  <datalist id="settings-bank-options">
                    {bankOptions.map((bank) => (
                      <option key={bank.code} value={bank.name} />
                    ))}
                  </datalist>
                  <p className="text-xs text-muted-foreground">
                    Suggestions loaded from Paystack for{' '}
                    {form.values.country || 'your country'}.
                  </p>
                </>
              ) : form.values.country.trim() ? (
                <p className="text-xs text-muted-foreground">
                  {isBanksLoading
                    ? 'Checking Paystack bank support for this country...'
                    : 'No Paystack bank directory is available for this country yet. You can enter the bank name manually.'}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <div className="relative">
                <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="accountNumber"
                  inputMode="numeric"
                  {...form.getInputProps('accountNumber')}
                  onChange={(event) =>
                    handleAccountNumberChange(event.target.value)
                  }
                  className="pl-9"
                  placeholder="6 to 20 digits"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              'Saving...'
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </>
            )}
          </Button>
        </div>
      </form>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="text-base font-semibold text-foreground">Support</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Need help with your {tenant.displayName} account?
        </p>
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <div>{tenant.supportEmail}</div>
          <div>{tenant.supportPhone}</div>
          {tenant.supportWhatsapp && <div>{tenant.supportWhatsapp}</div>}
        </div>
      </section>
    </div>
  )
}
