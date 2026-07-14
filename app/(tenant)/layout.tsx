import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import TenantSidebar from '@/components/tenant/Sidebar'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default async function TenantLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')
  if (session.user.role !== 'TENANT') redirect('/landlord')

  return (
    <div className="md:flex md:min-h-screen">
      <TenantSidebar />
      <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
    </div>
  )
}
