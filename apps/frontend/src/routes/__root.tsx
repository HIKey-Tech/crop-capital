import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import appCss from '../styles.css?url'
import type { User } from '@/types'

import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { NotFound } from '@/components/not-found'
import { TenantProvider } from '@/contexts/tenant'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false, // Don't refetch on window focus
    },
  },
})

interface RootContext {
  queryClient: QueryClient
  user?: User
}

export const Route = createRootRouteWithContext<RootContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'CropCapital - Agricultural Investment Platform',
      },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  beforeLoad: () => {
    return {
      queryClient,
    }
  },
  component: RootComponent,
  notFoundComponent: NotFound,
})

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <TenantProvider>
        <TooltipProvider>
          <Sonner />
          <Outlet />
        </TooltipProvider>
      </TenantProvider>
    </QueryClientProvider>
  )
}
