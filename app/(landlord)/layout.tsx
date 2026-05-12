import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LandlordSidebar from '@/components/landlord/Sidebar'

export default async function LandlordLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')
  if (session.user.role !== 'LANDLORD') redirect('/tenant')

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
      <LandlordSidebar />
      <main className="min-w-0 flex-1 overflow-auto">{children}</main>
    </div>
  )
}
