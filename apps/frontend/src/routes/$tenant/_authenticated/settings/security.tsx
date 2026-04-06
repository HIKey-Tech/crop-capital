import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { Eye, EyeOff, Lock, Save, Shield } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  PASSWORD_REQUIREMENTS_HINT,
  passwordConfirmationSchema,
  passwordSchema,
} from '@/api/auth/schema'
import { useUpdatePassword } from '@/hooks/use-auth'

export const Route = createFileRoute(
  '/$tenant/_authenticated/settings/security',
)({
  component: SecuritySettingsPage,
})

function SecuritySettingsPage() {
  const { mutate: updatePassword, isPending } = useUpdatePassword()

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const passwordResult = passwordSchema.safeParse(formData.newPassword)
    if (!passwordResult.success) {
      toast.error(passwordResult.error.issues[0]?.message ?? 'Invalid password')
      return
    }

    const confirmPasswordResult = passwordConfirmationSchema.safeParse({
      password: formData.newPassword,
      confirmPassword: formData.confirmPassword,
    })
    if (!confirmPasswordResult.success) {
      const confirmPasswordError = confirmPasswordResult.error.issues.find(
        (issue) => issue.path[0] === 'confirmPassword',
      )

      toast.error(
        confirmPasswordError?.message ??
          'Please confirm your password before continuing',
      )
      return
    }

    updatePassword(
      {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      },
      {
        onSuccess: () => {
          toast.success('Password updated successfully')
          setFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          })
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Failed to update password')
        },
      },
    )
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-4 pb-6 border-b border-border">
        <div className="p-3 bg-primary/10 rounded-full">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Security Settings</h2>
          <p className="text-muted-foreground">
            Manage your password and security preferences.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Change Password</h3>
          <p className="text-sm text-muted-foreground">
            Ensure your account is using a strong password to stay secure.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="currentPassword"
              type={showCurrentPassword ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={(e) =>
                setFormData({ ...formData, currentPassword: e.target.value })
              }
              className="pl-9 pr-10"
              placeholder="Enter current password"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showCurrentPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
              className="pl-9 pr-10"
              placeholder="Enter new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            {PASSWORD_REQUIREMENTS_HINT}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="pl-9 pr-10"
              placeholder="Confirm new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              'Updating...'
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" /> Update Password
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
