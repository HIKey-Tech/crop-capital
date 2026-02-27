import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/$tenant/_authenticated/admin/')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/$tenant/admin/farms',
      params: { tenant: params.tenant },
    })
  },
  component: AdminIndexRedirect,
})

function AdminIndexRedirect() {
  return null
}
