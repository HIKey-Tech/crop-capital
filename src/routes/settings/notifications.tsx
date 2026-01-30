import { toast } from 'sonner'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export const Route = createFileRoute('/settings/notifications')({
  component: NotificationsSettingsPage,
})

function NotificationsSettingsPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Notification preferences saved')
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Configure how you receive notifications.
        </p>
      </div>
      <div className="border-t border-border" />

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Email Notifications</h4>
          <RadioGroup defaultValue="all">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all">All new messages</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mentions" id="mentions" />
              <Label htmlFor="mentions">Direct messages and mentions</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="none" />
              <Label htmlFor="none">Nothing</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Investment Updates</h4>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="roi" className="rounded border-gray-300" defaultChecked />
            <Label htmlFor="roi">ROI Payment Alerts</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="projects" className="rounded border-gray-300" defaultChecked />
            <Label htmlFor="projects">New Farm Projects</Label>
          </div>
        </div>

        <Button type="submit">Save preferences</Button>
      </form>
    </div>
  )
}
