import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/')({
  component: AuthIndexRoute,
})

function AuthIndexRoute() {
  return <Navigate to="/auth/sign-in" replace />
}
