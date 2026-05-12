import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import TenantSidebar from '@/components/tenant/Sidebar'

export default async function TenantLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')
  if (session.user.role !== 'TENANT') redirect('/landlord')

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
      <TenantSidebar />
      <main className="min-w-0 flex-1 overflow-auto">{children}</main>
    </div>
  )
}
