import {
  Link,
  Outlet,
  createFileRoute,
  useLocation,
} from '@tanstack/react-router'
import { Bell, FileCheck, Shield, User } from 'lucide-react'

export const Route = createFileRoute('/$tenant/_authenticated/settings')({
  component: SettingsLayout,
})

function SettingsLayout() {
  const { tenant } = Route.useParams()
  const { pathname } = useLocation()

  const navItems = [
    { to: '/$tenant/settings', label: 'Profile', icon: User },
    { to: '/$tenant/settings/security', label: 'Security', icon: Shield },
    {
      to: '/$tenant/settings/notifications',
      label: 'Notifications',
      icon: Bell,
    },
    {
      to: '/$tenant/settings/verification',
      label: 'Verification',
      icon: FileCheck,
    },
  ]

  return (
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 animate-fade-in px-4">
      <aside className="w-full md:w-64 shrink-0">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname.endsWith(item.to.replace('/$tenant', ''))
            return (
              <Link
                key={item.to}
                to={item.to}
                params={{ tenant }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      <main className="min-h-125 flex-1 rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
        <Outlet />
      </main>
    </div>
  )
}
