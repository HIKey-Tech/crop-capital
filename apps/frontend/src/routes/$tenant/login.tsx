import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/$tenant/login')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/$tenant/auth/sign-in',
      params: { tenant: params.tenant },
    })
  },
  component: () => null,
})
