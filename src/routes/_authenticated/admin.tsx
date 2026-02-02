import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: ({ context }) => {
    // User is guaranteed to exist from parent _authenticated route
    const { user } = context

    // Check if user is admin
    if (user.role !== 'admin') {
      throw redirect({
        to: '/dashboard',
      })
    }

    // Pass user down to child routes
    return { user }
  },
  component: () => <Outlet />,
})
