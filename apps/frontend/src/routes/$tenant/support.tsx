import { createFileRoute } from '@tanstack/react-router'
import {
  ExternalLink,
  HelpCircle,
  Mail,
  MessagesSquare,
  Phone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useTenant } from '@/contexts/tenant'

export const Route = createFileRoute('/$tenant/support')({
  component: SupportPage,
})

function SupportPage() {
  const { tenant } = useTenant()
  const websiteUrl = tenant.websiteUrl?.trim()
  const supportWhatsapp = tenant.supportWhatsapp?.trim()
  const whatsappHref = supportWhatsapp
    ? `https://wa.me/${supportWhatsapp.replace(/[^\d]/g, '')}`
    : null

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in px-4">
      <div className="text-center space-y-2 py-8">
        <h1 className="text-3xl font-bold tracking-tight">How can we help?</h1>
        <p className="text-muted-foreground text-lg">
          Find answers or contact the {tenant.displayName} support team.
        </p>
        {tenant.tagline && (
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            {tenant.tagline}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <HelpCircle className="h-5 w-5" /> Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              'How do I invest?',
              'When are returns paid?',
              'Is my capital guaranteed?',
            ].map((q, i) => (
              <div
                key={i}
                className="border rounded-lg p-4 hover:bg-accent transition cursor-pointer"
              >
                <h3 className="font-medium flex justify-between">
                  {q}
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </h3>
              </div>
            ))}
          </div>

          <div className="pt-6">
            <h3 className="font-medium mb-3">Contact Information</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> {tenant.supportEmail}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> {tenant.supportPhone}
              </div>
              {supportWhatsapp && (
                <div className="flex items-center gap-2">
                  <MessagesSquare className="h-4 w-4" /> {supportWhatsapp}
                </div>
              )}
              {tenant.address && (
                <div className="flex items-start gap-2">
                  <HelpCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{tenant.address}</span>
                </div>
              )}
            </div>

            {(websiteUrl || whatsappHref) && (
              <div className="mt-4 flex flex-wrap gap-3">
                {websiteUrl && (
                  <Button asChild variant="outline" size="sm">
                    <a href={websiteUrl} target="_blank" rel="noreferrer">
                      Visit Website
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {whatsappHref && (
                  <Button asChild className="btn-primary-gradient" size="sm">
                    <a href={whatsappHref} target="_blank" rel="noreferrer">
                      WhatsApp Support
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm h-fit">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <MessagesSquare className="h-5 w-5" /> Send us a message
          </h2>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input placeholder="I have a question about..." />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                placeholder="Describe your issue..."
                className="min-h-30"
              />
            </div>
            <Button className="w-full btn-primary-gradient">
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
