import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Mail, MapPin, Save, User } from 'lucide-react'

import { useForm } from '@mantine/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUpdateProfile } from '@/hooks/use-auth'

export const Route = createFileRoute('/_authenticated/settings/')({
  component: ProfileSettingsPage,
})

function ProfileSettingsPage() {
  const { user } = Route.useRouteContext();
  const { mutate: updateProfile, isPending } = useUpdateProfile()

  const form = useForm({
    initialValues: {
      name: user?.name || '',
      country: user?.country || '',
    },
  })

  const handleSubmit = (values: typeof form.values) => {
    updateProfile(
      {
        name: values.name,
        country: values.country,
      },
      {
        onSuccess: () => {
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

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-6 pb-6 border-b border-border">
        <div className="relative group">
          <Avatar className="h-24 w-24 border-4 border-white shadow-sm">
            <AvatarImage src={user.photo} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </div>
        <div>
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-muted-foreground capitalize">
            {user.role} Account
          </p>
          {user.isVerified ? (
            <Badge
              variant="outline"
              className="mt-2 bg-green-50 text-green-700 border-green-200"
            >
              Verified
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="mt-2 bg-yellow-50 text-yellow-700 border-yellow-200"
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
            Contact support to change your email address.
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
    </div>
  )
}
