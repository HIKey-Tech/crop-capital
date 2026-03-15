import { Menu, User } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { clearAuthToken } from '@/lib/api-client'

interface SuperAdminHeaderProps {
  onMenuClick?: () => void
}

export function SuperAdminHeader({ onMenuClick }: SuperAdminHeaderProps) {
  const navigate = useNavigate()

  const handleSignOut = () => {
    clearAuthToken()
    navigate({ to: '/auth' })
    toast.success('Signed out successfully')
  }

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-muted rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">Landlord Console</h1>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border border-border"
            >
              <User className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5 text-sm font-medium">Super Admin</div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive cursor-pointer"
              onClick={handleSignOut}
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
