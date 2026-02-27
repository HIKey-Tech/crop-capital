import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$tenant/auth/')({
  component: AuthIndexRoute,
})

function AuthIndexRoute() {
  const { tenant } = Route.useParams()
  return <Navigate to="/$tenant/auth/sign-in" params={{ tenant }} replace />
}
