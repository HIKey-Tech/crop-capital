import { toast } from 'sonner'
import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export const Route = createFileRoute('/_authenticated/settings/notifications')({
  component: NotificationsSettingsPage,
})

function NotificationsSettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState('all')
  const [roiAlerts, setRoiAlerts] = useState(true)
  const [newProjects, setNewProjects] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Notification preferences saved')
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <div className="pb-6 border-b border-border">
        <h3 className="text-2xl font-bold mb-2">Notifications</h3>
        <p className="text-[15px] text-muted-foreground">
          Configure how you receive notifications.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-5">
          <h4 className="text-base font-semibold text-foreground">
            Email Notifications
          </h4>
          <RadioGroup
            value={emailNotifications}
            onValueChange={setEmailNotifications}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3 group">
              <RadioGroupItem
                value="all"
                id="all"
                className="border-2 h-5 w-5"
              />
              <Label
                htmlFor="all"
                className="cursor-pointer font-medium text-[15px] group-hover:text-primary transition-colors"
              >
                All new messages
              </Label>
            </div>
            <div className="flex items-center space-x-3 group">
              <RadioGroupItem
                value="mentions"
                id="mentions"
                className="border-2 h-5 w-5"
              />
              <Label
                htmlFor="mentions"
                className="cursor-pointer font-medium text-[15px] group-hover:text-primary transition-colors"
              >
                Direct messages and mentions
              </Label>
            </div>
            <div className="flex items-center space-x-3 group">
              <RadioGroupItem
                value="none"
                id="none"
                className="border-2 h-5 w-5"
              />
              <Label
                htmlFor="none"
                className="cursor-pointer font-medium text-[15px] group-hover:text-primary transition-colors"
              >
                Nothing
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-5">
          <h4 className="text-base font-semibold text-foreground">
            Investment Updates
          </h4>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 group">
              <Checkbox
                id="roi"
                checked={roiAlerts}
                onCheckedChange={(checked) => setRoiAlerts(checked as boolean)}
                className="h-5 w-5 border-2"
              />
              <Label
                htmlFor="roi"
                className="cursor-pointer font-medium text-[15px] group-hover:text-primary transition-colors"
              >
                ROI Payment Alerts
              </Label>
            </div>
            <div className="flex items-center space-x-3 group">
              <Checkbox
                id="projects"
                checked={newProjects}
                onCheckedChange={(checked) =>
                  setNewProjects(checked as boolean)
                }
                className="h-5 w-5 border-2"
              />
              <Label
                htmlFor="projects"
                className="cursor-pointer font-medium text-[15px] group-hover:text-primary transition-colors"
              >
                New Farm Projects
              </Label>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <Button type="submit" size="lg" className="min-w-[180px] h-11">
            <Save className="h-4 w-4 mr-2" /> Save preferences
          </Button>
        </div>
      </form>
    </div>
  )
}
